<?php

namespace Estimator\Repo\CreditCard;


use CreditCard;
use Receivable;

interface CreditCardInterface
{

    /**
     * @param array $data
     * @return CreditCard
     */
    public function create(array $data = []);

    /**
     * @param Receivable $receivable
     * @return CreditCard
     */
    public function createFromReceivableIfNotExists(Receivable $receivable);

    /**
     * @param array $data
     * @return CreditCard|null
     */
    public function preExistingCardFromData(array $data);
}