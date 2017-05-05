<?php namespace Estimator\CollectionOf;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Support\Jsonable;
use \Illuminate\Support\Collection;

/**
 * Class CollectionOf
 * @package Estimator\CollectionOf
 * A helper class to keep collections honest. Restricts membership of a collection to members of a specified $of_class
 */
abstract class CollectionOf extends Collection {

    /**
     * The fully qualified namespace of the class
     * that this is a collection of
     * @var string
     */
    protected static $of_class;

    public function __construct($items = [])
    {
        $this->validateItemsAreOfClass($items);
        parent::__construct($items);
    }

    /**
     * Create a new collection instance if the value isn't one already.
     *
     * @param mixed $items
     * @return static
     */
    public static function make($items = [])
    {
        static::validateItemsAreOfClass($items);
        return new static(parent::make($items));
    }

    /**
     * @param $items
     * @throws \Exception
     * @return static
     */
    public static function makeFromData($items = [])
    {
        // e.g...
        // $result = static::make();
        // foreach($items as $item) {
        //    $result->push(new static::$of_class($item));
        // }
        //
        // return $result;

        throw new \Exception("makeFromData method not implemented in collection ".static::class);
    }

    /**
     * Merge the collection with the given items.
     *
     * @param \Illuminate\Support\Collection | \Illuminate\Contracts\Support\Arrayable|array $items
     * @return static
     */
    public function merge($items)
    {
        static::validateItemsAreOfClass($items->all());
        return new static(parent::merge($items));
    }

    /**
     * Push an item onto the beginning of the collection.
     *
     * @param mixed $value
     * @param null $key
     * @throws IllegalCollectionMemberException
     * @return $this
     */
    public function prepend($value, $key = null)
    {
        static::validateIsOfClass($value);
        return new static(parent::prepend($value, $key));
    }

    /**
     * Push an item onto the end of the collection.
     *
     * @param mixed $value
     * @return $this
     */
    public function push($value)
    {
        static::validateIsOfClass($value);
        parent::push($value);
        return $this;
    }

    /**
     * Put an item in the collection by key.
     *
     * @param mixed $key
     * @param mixed $value
     * @return $this
     */
    public function put($key, $value)
    {
        static::validateIsOfClass($value);
        parent::put($key, $value);
        return $this;
    }

    /**
     * Set the item at a given offset.
     *
     * @param mixed $key
     * @param mixed $value
     * @return void
     */
    public function offsetSet($key, $value)
    {
        static::validateIsOfClass($value);
        parent::offsetSet($key, $value);
    }

    /**
     * Validate that a single item is an instance of the required class
     * @param $value
     * @return bool
     * @throws IllegalCollectionMemberException
     */
    protected static function validateIsOfClass($value)
    {
        if (!is_a($value, static::$of_class)) {
            Throw new IllegalCollectionMemberException('Item in collection passed to ' . get_called_class() . ' is not an instance of ' . static::$of_class . '. Parameter was: ' . json_encode($value));
        }
        return true;
    }

    /**
     * Validate that all items in a given array are instances of the required class
     * @param array $items
     * @throws IllegalCollectionMemberException
     */
    protected static function validateItemsAreOfClass($items)
    {
        $items = is_array($items) ? $items : self::convertToArrayable($items);
        foreach ($items as $key => $value) {
            static::validateIsOfClass($value);
        }
    }


    /**
     * @param array|Collection|Arrayable $items
     * @return static
     */
    public function diff($items)
    {
        return new static(array_udiff($this->items, $this->getArrayableItems($items), [$this, 'diffObjectsByReference']));
    }

    /**
     * Used in $this->diff() array_udiff call to see if two collections
     * contain the same object instances
     * @param $a
     * @param $b
     * @return int
     */
    protected function diffObjectsByReference($a, $b)
    {
        return strcmp(spl_object_hash($a), spl_object_hash($b));
    }

    /**
     * @param $items
     * @return array|mixed
     */
    protected static function convertToArrayable($items) {
        if ($items instanceof self) {
            return $items->all();
        } elseif ($items instanceof Arrayable) {
            return $items->toArray();
        } elseif ($items instanceof Jsonable) {
            return json_decode($items->toJson(), true);
        }

        return (array) $items;
    }
}