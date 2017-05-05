<?php

use App\Http\Requests\Request;
use Carbon\Carbon;
use Estimator\Commanding\CommandBus;
use Estimator\Payment\AddCreditCardToCustomerCommand;
use Estimator\Repo\FreeBox\FreeBoxInterface;
use Estimator\Api\Fractal\Transformers\FreeBoxTransformer;

use Illuminate\Http\JsonResponse;
use League\Fractal\Manager;
use League\Fractal\Resource\Item;

class BoxTrackerApiController extends Controller
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
     * BoxTrackerApiController constructor.
     * @param FreeBoxInterface $free_box_repo
     * @param Manager $fractal
     */
    public function __construct(FreeBoxInterface $free_box_repo, Manager $fractal)
    {
        $this->free_box_repo = $free_box_repo;
        $this->fractal = $fractal;
    }

    /**
     * Since we are using basic auth, we really just need to
     * verify that the credentials are valid
     * and return the user data
     *
     * If they made it this far, the credentials are valid
     * @see \App\Http\Middleware\AuthenticateOnceWithBasicAuth
     * @return JsonResponse
     */
    public function auth()
    {
        $user = auth()->user();
        $user_data = collect($user->getAttributes())->only([
            'first_name',
            'last_name',
            'user_name',
            'phone',
            'email'
        ]);

        return response()->json($user_data);
    }


}