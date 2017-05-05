<?php
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FreeBoxSupplies extends Model
{
    use SoftDeletes;

    protected $table = 'free_box_supplies';
    protected static $unguarded = true;


    /**
     * @return array
     */
    public static function boxTrackerOptions()
    {
        $supplies = FreeBoxSupplies::all();
        $result = [];

        foreach ($supplies as $item) {
            $result[] = [
                'id' => $item->id,
                'label' => $item->label,
                'cost' => $item->cost,
                'icon' => $item->icon,
                'dimensions' => $item->dimensions,
                'cube' => $item->cube,
                'refundable' => $item->refundable
            ];
        }

        return $result;
    }
}