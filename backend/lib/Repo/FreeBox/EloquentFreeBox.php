<?php namespace Estimator\Repo\FreeBox;


use Carbon\Carbon;
use CreditCard;
use Estimator\Eventing\EventDispatcher;
use Estimator\Eventing\EventGenerator;
use Estimator\FreeBox\FreeBoxCollection;
use Estimator\FreeBox\FreeBoxRefundForfeited;
use Estimator\FreeBox\FreeBoxStatusUpdated;
use Estimator\FreeBox\FreeBoxSuppliesCollection;
use Estimator\FreeBox\FreeBoxSuppliesDroppedOff;
use Estimator\FreeBox\FreeBoxSuppliesPickedUp;
use Exception;
use FreeBox;
use Customer;
use FreeBoxSupplies;

class EloquentFreeBox implements FreeBoxInterface
{
    use EventGenerator;

    /**
     * @var FreeBox
     */
    protected $free_box;

    /**
     * @var EventDispatcher
     */
    private $event;

    /**
     * EloquentFreeBox constructor.
     * @param FreeBox $free_box
     * @param EventDispatcher $event
     */
    public function __construct(FreeBox $free_box, EventDispatcher $event)
    {
        $this->free_box = $free_box;
        $this->event = $event;
    }

    /**
     * @param Customer $customer
     * @return FreeBox
     */
    public function firstOrCreateByCustomer(Customer $customer)
    {
        $box = $this->free_box->firstOrNew(['customer_id' => $customer->getKey()]);

        if (!$box->exists) {
            $customer->freeBoxProgram()->save($box);
            $box->fresh();
        }

        return $box;
    }

    /**
     * @param Customer $customer
     * @return FreeBox|null
     */
    public function findReturnable(Customer $customer)
    {
        return $this->free_box
            ->where('customer_id', '=', $customer->getKey())
            ->where('status', '=', FreeBox::STATUS_OUT)
            ->get()
            ->first();
    }

    /**
     * @param $box
     * @param array $data
     * @return FreeBox
     */
    public function update(FreeBox $box, array $data = [])
    {
        $keys = ['supplies_out', 'data', 'status'];

        foreach($keys as $key) {
            if (isset($data[$key])) {
                $box->{camel_case($key)} = $data[$key];
            }
        }

        $dates = ['actual_return_date', 'pickup_date', 'scheduled_return_date'];

        foreach($dates as $date) {
            if (isset($data[$date])) {
                $box->{$date} = new Carbon($data[$date]);
            }
        }

        $box->save();

        return $box;
    }

    public function pickupSupplies(FreeBox $box, FreeBoxSuppliesCollection $suppliesGoingOut, $return_date)
    {
        $suppliesAlreadyOut = $box->supplies_out;
        $suppliesGoingOut = $suppliesGoingOut->filter(function(FreeBoxSupplies $item) {
            return $item->refundable;
        });

        foreach($suppliesGoingOut as $goingOut) {
            $matched = false;
            foreach($suppliesAlreadyOut as $a => $alreadyOut) {
                if ($goingOut->id === $alreadyOut->id) {
                    $matched = true;
                    $suppliesAlreadyOut[$a]->quantity += $goingOut->quantity;
                }
            }
            if (!$matched) {
                $suppliesAlreadyOut->push($goingOut);
            }
        }

        $box->supplies_out = $suppliesAlreadyOut;
        $box->pickup_date = Carbon::now();
        $box->scheduled_return_date = new Carbon($return_date);

        if (!$saved = $this->updateStatus($box)) {
            $box->save();
        }

        $this->event->dispatch(new FreeBoxSuppliesPickedUp($box, $suppliesGoingOut));

        return $box;
    }


    /**
     * @param FreeBox $box
     * @param FreeBoxSuppliesCollection $suppliesIn
     * @return FreeBox
     */
    public function returnSupplies(FreeBox $box, FreeBoxSuppliesCollection $suppliesIn)
    {
        $suppliesOut = $box->supplies_out;

        foreach($suppliesOut as $o => $out) {
            foreach($suppliesIn as $in) {
                if ($in->id === $out->id) {
                    $suppliesOut[$o]->quantity = $out->quantity - $in->quantity;
                }
            }
        }

        $box->supplies_out = $suppliesOut->filter(
            function(FreeBoxSupplies $item) {
                return $item->quantity > 0;
            });

        $box->actual_return_date = Carbon::now();

        if (!$saved = $this->updateStatus($box)) {
            $box->save();
        }

        $this->event->dispatch(new FreeBoxSuppliesDroppedOff($box, $suppliesIn));

        return $box;
    }

    /**
     * @param FreeBox $box
     * @return FreeBoxSuppliesCollection
     */
    public function clearSuppliesOut(FreeBox $box)
    {
        $supplies = $box->supplies_out;
        $box->supplies_out = [];

        if (!$saved = $this->in($box)) {
            $box->save();
        }

        $this->event->dispatch(new FreeBoxRefundForfeited($box, $supplies));

        return $supplies;
    }


    /**
     * Set status to indicate supplies are out
     * @param FreeBox $box
     * @return boolean - was the record saved to the database?
     */
    public function out(FreeBox $box)
    {
        return $this->updateStatus($box, 'out');
    }

    /**
     * Set status to indicate all supplies are in
     * @param FreeBox $box
     * @return boolean - was the record saved to the database?
     */
    public function in(FreeBox $box)
    {
        return $this->updateStatus($box, 'in');
    }

    /**
     * @param FreeBox $box
     * @param $new string|null
     * @return boolean - was the record saved to the database?
     * @throws Exception
     */
    public function updateStatus(FreeBox $box, $new = null)
    {

        if (!$new) { // set it based on whether the current box has any supplies attached
            if ($box->supplies_out->isEmpty()) {
                // all in
                return $this->in($box);
            } else {
                // at least some returnable supplies are out
                return $this->out($box);
            }
        }

        $old = $box->status;
        if ($old === $new) {
            // don't need to update this ...
            return false;
        }

        $box->status = $new;
        if ($box->save()) {
            $this->event->dispatch(new FreeBoxStatusUpdated($box, $new, $old));
            return true;
        } else {
            throw new Exception("Failed to update FreeBox #" . $box->getKey() . " from status $old to $new");
        }
    }

    protected function newInstance()
    {
        return new FreeBox;
    }
}