<?php

use Estimator\Activity\ActivityCollection;
use Estimator\FreeBox\FreeBoxSuppliesCollection;
use Estimator\Payment\NotificationRecipient;
use Estimator\Payment\ChargeDescription;
use Estimator\Payment\ChargeDescriptionCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Class FreeBox
 * @property FreeBoxSuppliesCollection $supplies_out
 * @property $data stdClass
 */
class FreeBox extends Model implements PayableInterface
{
    protected $table = 'free_box';
    protected static $unguarded = ['data', 'value'];

    const STATUS_IN = 0;
    const STATUS_OUT = 1;

    public $include_options = true;

    protected $statusConstMap = [
        self::STATUS_IN => 'in',
        self::STATUS_OUT => 'out',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphMany
     */
    public function receivables()
    {
        return $this->morphMany(Receivable::class, 'payable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphMany
     */
    public function activity()
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    /**
     * @param int $page
     * @param int $per_page
     * @return ActivityCollection
     */
    public function pagedActivity($page = 1, $per_page = 20)
    {
        $offset = $per_page * $page - 1;
        $activity = $this->activity->skip($offset)->take($per_page)->get();
        return ActivityCollection::make($activity);
    }

    /**
     * @return bool
     */
    public function isIn()
    {
        return $this->statusIs(self::STATUS_IN);
    }

    /**
     * @return bool
     */
    public function isOut()
    {
        return $this->statusIs(self::STATUS_OUT);
    }

    /**
     * @return $this
     */
    public function getPayable()
    {
        return $this;
    }

    /**
     * @return Customer
     */
    public function getCustomer()
    {
        return $this->customer;
    }

    /**
     * @return string
     */
    public function getPayableType()
    {
        return FreeBox::class;
    }

    /**
     * @return NotificationRecipient
     */
    public function getNotificationRecipient()
    {
        return new NotificationRecipient(
            $this->getCustomer()->fullName(),
            $this->getCustomer()->email_address
        );
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getReceivables()
    {
        return $this->receivables;
    }

    /**
     * @param null $type
     * @return ChargeDescriptionCollection
     */
    public function getChargeDescriptions($type = null)
    {
        if (!$type) {
            throw new InvalidArgumentException('Type parameter must be specified for FreeBox::getChargeDescription($type)');
        }
        return ChargeDescriptionCollection::make([]);
    }

    /**
     * @param $value
     */
    public function setSuppliesOutAttribute($value = [])
    {
        $this->attributes['supplies_out'] = collect($value)->toJson();
    }

    /**
     * @param $value
     * @return FreeBoxSuppliesCollection
     */
    public function getSuppliesOutAttribute($value = [])
    {
        $supplies = json_decode($value) ?: [];
        return FreeBoxSuppliesCollection::makeFromData($supplies);
    }

    /**
     * @param $value
     * @return mixed|object
     */
    public function getDataAttribute($value)
    {
        return json_decode($value);
    }

    /**
     * @param $value
     */
    public function setDataAttribute($value)
    {
        $this->attributes['data'] = json_encode($value);
    }

    /**
     * @return string
     */
    public function getStatusAttribute()
    {
        if (!isset($this->attributes['status'])) {
            $this->attributes['status'] = 0;
        }
        return $this->statusConstMap[$this->attributes['status']];
    }

    /**
     * @param $status
     * @throws InvalidArgumentException
     */
    public function setStatusAttribute($status)
    {
        foreach($this->statusConstMap as $k => $v) {
            if ($status === $v) {
                $this->attributes['status'] = $k;
                return;
            }
        }
        throw new InvalidArgumentException('FreeBox status must be either "out" or "in". Received "'.$status.'"');
    }

    /**
     * @param $date
     * @return null|$date
     */
    public function getScheduledReturnDateAttribute($date)
    {
        return $this->dateOrNull($date);
    }

    /**
     * @param $date
     * @return null|$date
     */
    public function getActualReturnDateAttribute($date)
    {
        return $this->dateOrNull($date);
    }

    /**
     * @param $date
     * @return null|$date
     */
    public function getPickupDateAttribute($date)
    {
        return $this->dateOrNull($date);
    }

    /**
     * @param $status
     * @return bool
     */
    protected function statusIs($status)
    {
        if (!isset($this->attributes['status'])) {
            return $status === 0;
        }
        return $this->attributes['status'] === $status;
    }

    /**
     * @param $k
     * @param $v
     * @throws Exception
     */
    protected function addToData($k, $v)
    {
        $data = $this->data;
        $current = $data->{$k};

        if(str_contains($k, '[]')) {
            if (empty($current)) {
                $current = [];
            }
            if (!is_array($current)) {
                throw new \Exception("Can not use [] operator to set data on key value that is not an array");
            }

            $current[] = $v;
        } else {
            $current = $v;
        }
        $data->{$k} = $current;
        $this->data = $data;
    }

    /**
     * @param $k
     * @return Collection|mixed
     */
    protected function getFromData($k) {
        $data = $this->data;
        if (isset($data->{$k})) {
            if (is_array($data->{$k})) {
                return collect($data->{$k});
            } else {
                return $data->{$k};
            }
        } else {
            return collect();
        }
    }

    /**
     * @param $date
     * @return null|$date
     */
    protected function dateOrNull($date)
    {
        if ($date === '0000-00-00 00:00:00') {
            return null;
        }
        return $date;
    }

}