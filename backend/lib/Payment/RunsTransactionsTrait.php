<?php namespace Estimator\Payment;

use CreditCard;
use Estimator\Commanding\CommandBus;
use Estimator\Service\Payment\ChargeDescription;
use Estimator\Service\Payment\ChargeDescriptionCollection;
use Estimator\Payment\PaymentInterface;
use Estimator\Validating\ValidationFailedResponse;
use Illuminate\Contracts\Validation\Factory;
use Illuminate\Http\JsonResponse;
use PayableInterface;

/**
 * Trait RunsTransactionsTrait
 * Use this in any controller to allow it to run transactions
 */
trait RunsTransactionsTrait
{
    /**
     * @var bool
     */
    private $input_validated = false;

    /**
     * @var array
     */
    private static $transaction_type_map = [
        'deposit' => PaymentInterface::TRANSACTION_TYPE_PURCHASE,
        'payment' => PaymentInterface::TRANSACTION_TYPE_PURCHASE,
        'refund' => PaymentInterface::TRANSACTION_TYPE_REFUND
    ];

    /**
     * @var array
     */
    private static $payment_methods = [
        'creditCard',
        'cash'
    ];

    /**
     * This method is public so that it can be accessed from a route declaration
     * @param PayableInterface $payable
     * @param $transactionType
     * @param $paymentMethod
     * @param CreditCard|null $creditCard
     * @return JsonResponse
     */
    public function runTransaction(PayableInterface $payable, $transactionType, $paymentMethod, CreditCard $creditCard = null)
    {
        $result = $this->getTransactionCommandResponse($payable, $transactionType, $paymentMethod, $creditCard);
        return $this->transactionResponse($result);
    }

    /**
     * This method allows the calling controller to implement any extra special logic
     * @param PayableInterface $payable
     * @param $transactionType
     * @param $paymentMethod
     * @param CreditCard|null $creditCard
     * @return ValidationFailedResponse|RunExistingCardTransactionCommandResponse|RunCashTransactionCommandResponse 
     */
    protected function getTransactionCommandResponse(PayableInterface $payable, $transactionType, $paymentMethod, CreditCard $creditCard = null)
    {
        $validation_result = $this->validateForTransaction($transactionType, $paymentMethod);

        if ($validation_result instanceof ValidationFailedResponse ) {
            return $validation_result;
        }
        
        $command = $this->getTransactionCommand($payable, $transactionType, $paymentMethod, $creditCard);
        
        return app()->make(CommandBus::class)->execute($command);
    }
    
    /**
     * @param PayableInterface $payable
     * @param $transactionType
     * @param $paymentMethod
     * @param CreditCard $creditCard
     * @return RunCashTransactionCommand|RunExistingCardTransactionCommand
     */
    private function getTransactionCommand(PayableInterface $payable, $transactionType, $paymentMethod, CreditCard $creditCard = null)
    {
        // this has already been validated
        if ($paymentMethod === 'creditCard') {
            return $this->getCreditCardTransactionCommand($creditCard, $payable, $transactionType);
        } else if($paymentMethod === 'cash') {
            return $this->getCashTransactionCommand($payable, $transactionType);
        }
    }


    /**
     * @param PayableInterface $payable
     * @param $transactionType
     * @return RunCashTransactionCommand
     */
    private function getCashTransactionCommand(PayableInterface $payable, $transactionType)
    {
        return new RunCashTransactionCommand(
            request('amount'),
            $payable,
            $this->getTransactionChargeDescriptions(),
            static::$transaction_type_map[$transactionType],
            request('signature')
        );
    }

    /**
     * @param CreditCard $creditCard
     * @param PayableInterface $payable
     * @param $transactionType
     * @return RunExistingCardTransactionCommand
     */
    private function getCreditCardTransactionCommand(CreditCard $creditCard, PayableInterface $payable, $transactionType)
    {
        return new RunExistingCardTransactionCommand(
            $creditCard,
            request('amount'),
            $payable,
            $this->getTransactionChargeDescriptions(),
            static::$transaction_type_map[$transactionType],
            request('signature')
        );
    }

    /**
     * @return ChargeDescriptionCollection
     */
    private function getTransactionChargeDescriptions()
    {
        // RUN THE CHARGE
        $desc_input = request('description');

        return new ChargeDescriptionCollection([
            new ChargeDescription(
                $desc_input['name'],
                $desc_input['amount'],
                $desc_input['description'],
                isset($desc_input['itemized']) ? $desc_input['itemized'] : []
            )
        ]);
    }

    /**
     * @param $transactionType
     * @param $paymentMethod
     * @return ValidationFailedResponse|null
     */
    private function validateForTransaction($transactionType, $paymentMethod)
    {
        if (!array_key_exists($transactionType, static::$transaction_type_map)) {
            logInvalid(static::class, __METHOD__, "transaction type", array_keys(static::$transaction_type_map), $transactionType);
            return new ValidationFailedResponse(['Invalid transaction type']);
        }
        
        if (!in_array($paymentMethod, static::$payment_methods)) {
            logInvalid(static::class, __METHOD__, "payment method", static::$payment_methods, $paymentMethod);
            return new ValidationFailedResponse(['Invalid payment method']);
        }
        
        // VALIDATE
        $validator = app()->make(Factory::class)->make(
            request()->all(),
            [
                'amount' => 'required|integer',
                'description' => 'required|array',
                'description.amount' => 'required|integer',
                'description.name' => 'required',
                'description.description' => 'required',
                'signature' => "required_without:agreed",
                'agreed' => "required_without:signature"
            ]
        );

        if ($validator->fails()) {
            // really just want the messages though ...
            $errors = array_values(array_flatten($validator->getMessageBag()->all()));
            return new ValidationFailedResponse($errors);
        } else {
            $this->input_validated = true;
        }
    }


    /**
     * @param ValidationFailedResponse|RunExistingCardTransactionCommandResponse $result
     * @return JsonResponse
     */
    private function transactionResponse($result)
    {
        if ($result instanceof ValidationFailedResponse) {
            return response()->json(['errors' => $result->errors()], 400);
        } else {
            return response()->json();
        }
    }

    /**
     * @return integer
     * @throws \Exception
     */
    private function transactionAmount()
    {
        if (!$this->input_validated) {
            throw new \Exception("Must validation credit card input before accessing charge amount");
        }
        return (int) request('amount');
    }
}