<?php
use Estimator\FreeBox\FreeBoxSuppliesCollection;
use Estimator\Payment\RunsTransactionsTrait;
use Estimator\Repo\FreeBox\FreeBoxInterface;
use Estimator\Api\Fractal\Transformers\FreeBoxTransformer;
use Estimator\Validating\ValidationFailedTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use League\Fractal\Manager;
use League\Fractal\Resource\Item;

/**
 * Created by PhpStorm.
 * User: pearl
 * Date: 3/9/17
 * Time: 11:19 AM
 */
class FreeBoxApiController extends Controller
{
    use ValidationFailedTrait, RunsTransactionsTrait;
    
    /**
     * @var FreeBoxInterface
     */
    protected $free_box_repo;
    
    /**
     * @var Manager
     */
    protected $fractal;
    /**
     * @var \Estimator\Eventing\EventDispatcher
     */
    protected $event;

    /**
     * FreeBoxApiController constructor.
     * @param FreeBoxInterface $free_box_repo
     * @param Manager $fractal
     * @param \Estimator\Eventing\EventDispatcher $event
     */
    public function __construct(FreeBoxInterface $free_box_repo, Manager $fractal, \Estimator\Eventing\EventDispatcher $event)
    {
        $this->free_box_repo = $free_box_repo;
        $this->fractal = $fractal;
        $this->event = $event;
    }

    /**
     * @param FreeBox $freeBox
     * @return JsonResponse
     */
    public function show(FreeBox $freeBox)
    {
        return $this->freeBoxSuccessResponse($freeBox);
    }

    /**
     * @param FreeBox $freeBox
     * @return JsonResponse
     */
    public function clearUnreturned(FreeBox $freeBox)
    {
        if ($this->free_box_repo->clearSuppliesOut($freeBox)) {
            return response()->json();
        }
        return response()->json(['errors' => ['Unable to clear boxes ... ']], 400);
    }

    /**
     * @param FreeBox $box
     * @param Request $request
     * @return JsonResponse
     */
    public function pickupBoxes(FreeBox $box, Request $request)
    {
        $this->validate($request, ['scheduled_return_date' => 'required|date']);
        $this->validateRequestSupplies($request, 'pickup_supplies');

        $supplies = FreeBoxSuppliesCollection::makeFromData($request['pickup_supplies']);

        $box = $this->free_box_repo->pickupSupplies($box, $supplies, $request['scheduled_return_date']);
        return $this->freeBoxSuccessResponse($box);
    }

    /**
     * @param FreeBox $box
     * @param Request $request
     * @return JsonResponse
     */
    public function returnBoxes(FreeBox $box, Request $request)
    {
        $this->validateRequestSupplies($request, 'returning_supplies');

        $supplies = FreeBoxSuppliesCollection::makeFromData($request['returning_supplies']);

        $box = $this->free_box_repo->returnSupplies($box, $supplies);
        return $this->freeBoxSuccessResponse($box);
    }

    /**
     * @param FreeBox $free_box
     * @return JsonResponse
     */
    protected function freeBoxSuccessResponse(FreeBox $free_box)
    {
        // at this point options are already loaded in the app
        // it's kinda bulky data so best not to send it more than once
        $free_box->include_options = false;
        $resource = new Item($free_box, new FreeBoxTransformer(), 'free_box');
        $response = $this->fractal->createData($resource)->toArray();
        return response()->json($response);
    }


    /**
     * @param Request $request
     * @param $array_param_name
     * @return Request
     */
    protected function validateRequestSupplies(Request $request, $array_param_name)
    {
        $this->validate($request, [
            $array_param_name => 'required|array',
        ]);
        $input = $request->all();

        foreach($request[$array_param_name] as $supply) {
            $request->replace($supply);
            $this->validate($request, [
                'id' => 'required|integer|exists:free_box_supplies,id',
                'cost' => 'required|integer',
                'label' => 'required'
            ]);
        }
        $request->replace($input);
        return $request;
    }
    
}