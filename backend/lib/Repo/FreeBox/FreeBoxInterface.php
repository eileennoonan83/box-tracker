<?php namespace Estimator\Repo\FreeBox;

use Customer;
use Estimator\Eventing\EventGeneratable;
use Estimator\FreeBox\FreeBoxCollection;
use Estimator\FreeBox\FreeBoxSuppliesCollection;
use FreeBox;

interface FreeBoxInterface extends EventGeneratable
{

    /**
     * @param Customer $customer
     * @return FreeBox
     */
    public function firstOrCreateByCustomer(Customer $customer);

    /**
     * @param Customer $customer
     * @return FreeBox|null
     */
    public function findReturnable(Customer $customer);

    /**
     * @param FreeBox $box
     * @param array $data
     * @return FreeBox
     */
    public function update(FreeBox $box, array $data = []);

    /**
     * @param FreeBox $box
     * @return boolean
     */
    public function clearSuppliesOut(FreeBox $box);

    /**
     * Set status to indicate supplies are out
     * @param FreeBox $box
     * @return FreeBox|null
     */
    public function out(FreeBox $box);

    /**
     * Set status to indicate all supplies are in
     * @param FreeBox $box
     * @return FreeBox|null
     */
    public function in(FreeBox $box);

    /**
     * @param FreeBox $box
     * @param $new string|null
     * @return boolean - was the record saved to the database?
     * @throws \Exception
     */
    public function updateStatus(FreeBox $box, $new = null);

    /**
     * @param FreeBox $box
     * @param FreeBoxSuppliesCollection $supplies
     * @param $return_date
     * @return FreeBox
     */
    public function pickupSupplies(FreeBox $box, FreeBoxSuppliesCollection $supplies, $return_date);

    /**
     * @param FreeBox $box
     * @param FreeBoxSuppliesCollection $supplies
     * @return FreeBox
     */
    public function returnSupplies(FreeBox $box, FreeBoxSuppliesCollection $supplies);

}