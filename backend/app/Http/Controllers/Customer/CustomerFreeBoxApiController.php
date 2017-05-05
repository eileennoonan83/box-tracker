<?php

use Estimator\Repo\FreeBox\FreeBoxInterface;
use Estimator\Service\Api\Fractal\Transformers\FreeBoxTransformer;
use Illuminate\Http\JsonResponse;
use League\Fractal\Manager;
use League\Fractal\Resource\Item;

class CustomerFreeBoxApiController extends Controller
{
    /**
     * @var FreeBoxInterface
     */
    protected $free_box_repo;
    /**
     * @var Manager
     */
    protected $fractal;

    /**
     * CustomerFreeBoxApiController constructor.
     * @param FreeBoxInterface $free_box_repo
     * @param Manager $fractal
     */
    public function __construct(FreeBoxInterface $free_box_repo, Manager $fractal)
    {
        $this->free_box_repo = $free_box_repo;
        $this->fractal = $fractal;
    }

    /**
     * @param Customer $customer
     * @return JsonResponse
     */
    public function show(Customer $customer)
    {
        if (!$box = $this->free_box_repo->firstOrCreateByCustomer($customer)) {
            return response()->json('Unable to find or create free boxes', 503);
        }

        return $this->customerBoxSuccessResponse($box);
    }

    /**
     * @param Customer $customer
     * @return JsonResponse
     */
    public function getPickUpBoxes(Customer $customer) {
        return $this->show($customer);
    }

    /**
     * @param Customer $customer
     * @return JsonResponse
     */
    public function getReturnBoxes(Customer $customer)
    {
        if (!$boxes = $this->free_box_repo->findReturnable($customer)) {
            return response()->json('Customer #'.$customer->getKey().' has no returnable boxes', 404);
        }

        return $this->customerBoxSuccessResponse($boxes);
    }


    /**
     * @param FreeBox $box
     * @return JsonResponse
     */
    private function customerBoxSuccessResponse(FreeBox $box)
    {
        $resource = new Item($box, new FreeBoxTransformer, 'free_box');
        $response = $this->fractal->createData($resource)->toArray();
        return response()->json($response);
    }
}