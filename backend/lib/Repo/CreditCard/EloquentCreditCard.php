<?php namespace Estimator\Repo\CreditCard;


use CreditCard;
use Estimator\Eventing\EventDispatcher;
use Estimator\Payment\CardExistsOnCustomerException;
use Estimator\Payment\CreditCardWasAddedToCustomer;
use Estimator\Repo\Receivable\ReceivableInterface;
use Estimator\Service\Estimator\Exception\MissingMandatoryParametersException;
use Estimator\Service\Payment\FirstDataResponse;
use Receivable;

class EloquentCreditCard implements CreditCardInterface
{
    /**
     * @var CreditCard
     */
    private $card;

    /**
     * @var ReceivableInterface
     */
    private $receivable_repo;
    /**
     * @var EventDispatcher
     */
    private $event;

    /**
     * EloquentCreditCard constructor.
     * @param CreditCard $card
     * @param EventDispatcher $event
     * @param ReceivableInterface $receivable_repo
     */
    public function __construct(CreditCard $card, EventDispatcher $event, ReceivableInterface $receivable_repo)
    {
        $this->receivable_repo = $receivable_repo;
        $this->card = $card;
        $this->event = $event;
    }

    /**
     * @param array $data
     * @return CreditCard
     * @throws MissingMandatoryParametersException
     */
    public function create(array $data = [])
    {
        $required = ['customer_id', 'type', 'cardholder_name', 'token', 'expiration_date'];

        foreach($required as $k => $v) {
            if (!isset($data[$v])) {
                throw new MissingMandatoryParametersException('Cannot create CreditCard, required parameter '.$v.' is missing');
            }
        }

        if ($card = $this->preExistingCardFromData($data)) {
            if ($card->customer_id === (integer) $data['customer_id']) {
                throw new CardExistsOnCustomerException('This card already exists for this customer');
            }
        }

        $card = new CreditCard;
        $card->customer_id = $data['customer_id'];
        $card->type = $data['type'];
        $card->cardholder_name = $data['cardholder_name'];
        $card->token = $data['token'];
        $card->expiration_date = $data['expiration_date'];
        $card->data = empty($data['data']) ? (object) [] : $data['data'];
        $card->save();

        if (!empty($data['receivable_id'])) {
            if ($receivable = Receivable::find($data['receivable_id'])) {
                $card->receivables()->save($receivable);
            }
        }

        $this->event->dispatch(new CreditCardWasAddedToCustomer($card));

        return $card;
    }

    public function createFromReceivableIfNotExists(Receivable $receivable)
    {
        if ($receivable->payable_type !== 'Job' || $receivable->api_vendor !== 'firstdata' || !$receivable->hasTransarmorToken()) {
            // noop
            return null;
        }

        $existence_check_data = [
            'cardholder_name' => $receivable->getMessageAttribute('cardholder_name'),
            'type' => $receivable->getMessageAttribute('credit_card_type'),
            'expiration_date' => $receivable->getMessageAttribute('cc_expiry')
        ];

        if ($existing = $this->preExistingCardFromData($existence_check_data)) {
            // if it exists, just attach the receivable
            $existing->receivables()->save($receivable);
            return $existing;
        }

        return $this->create([
            'receivable_id' => $receivable->getKey(),
            'customer_id' => $receivable->customer_id,
            'cardholder_name' => $receivable->getMessageAttribute('cardholder_name'),
            'type' => $receivable->getMessageAttribute('credit_card_type'),
            'token' => $receivable->getMessageAttribute('transarmor_token'),
            'expiration_date' => $receivable->getMessageAttribute('cc_expiry'),
            'data' => '{}',
            'created_at' => $receivable->created_at
        ]);
    }

    /**
     * @param array $data
     * @return CreditCard|null
     */
    public function preExistingCardFromData(array $data)
    {
        $query = $this->card
            ->where('cardholder_name', '=', $data['cardholder_name'])
            ->where('type', '=', $data['type'])
            ->where('expiration_date', '=', $data['expiration_date'])
            ->where('customer_id', '=', $data['customer_id']);

        return $query->get()->first();
    }
}