<?php

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

class BoxTrackerSearchApiController extends Controller
{

    /**
     * @return JsonResponse
     */
    public function customerSearchGetBoxes()
    {
        $s = request('s');
        if (empty($s)) {
            return response()->json(['customers' => []]);
        }

        $query = $this->baseCustomerQuery($s)
            ->with('freeBoxProgram');

        $customers = $query->get(['id', 'first_name', 'last_name', 'email_address', 'phone'])
            ->map(function(Customer $customer) {
                $free_box_id = $customer->freeBoxProgram ? $customer->freeBoxProgram->first()->getKey() : null;
                return [
                    'id' => $customer->getKey(),
                    'firstName' => $customer->first_name,
                    'lastName' => $customer->last_name,
                    'emailAddress' => $customer->email_address,
                    'phone' => $customer->phone,
                    'freeBoxId' => $free_box_id
                ];
            });

        return response()->json(['customers' => $customers->values()]);
    }

    /**
     * @return JsonResponse
     */
    public function customerSearchReturnBoxes()
    {
        $s = request('s');
        if (empty($s)) {
            return response()->json(['customers' => []]);
        }

        $query = $this->baseCustomerQuery($s);
        $query->whereHas('freeBoxProgram', function(Builder $query) {
            $query->where('free_box.status', '=', FreeBox::STATUS_OUT);
        })
        ->with('freeBoxProgram');

        $customers = $query->get(['id', 'first_name', 'last_name', 'email_address', 'phone'])
            ->map(function(Customer $customer) {
                return [
                    'id' => $customer->getKey(),
                    'firstName' => $customer->first_name,
                    'lastName' => $customer->last_name,
                    'emailAddress' => $customer->email_address,
                    'phone' => $customer->phone,
                ];
            });
        return response()->json(['customers' => $customers->values()]);
    }

    /**
     * @param string $s
     * @return Builder
     */
    protected function baseCustomerQuery($s)
    {
        $query = Customer::where('last_name', 'like', $s.'%')
            ->orWhere('first_name', 'like', $s.'%')
            ->with('jobs')
        ;

        if (str_contains($s, ' ')) {
            $query->orWhere('quick_search_text', 'like', $s.'%');
        }
        if (str_contains($s, '@')) {
            $query->orWhere('email_address', 'like', "$s%");
        }

        // if there are numbers in it, run a lookup by phone number...
        // TODO: index this column?
        if (preg_match('/[0-9]+/', $s))
        {
            $n = preg_replace("/[^0-9]/","",$s);
            $query->orWhere('phone', '=', $n);
        }

        return $query;
    }

}