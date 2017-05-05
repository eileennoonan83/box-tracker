<?php

namespace App\Http\Middleware;

use Auth;
use Closure;
use Illuminate\Http\Request;

class AuthenticateOnceWithBasicAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
//        echo json_encode([$request->headers->all()]); die();
//        $auth = $request->headers->get('Authorization');
//        $hash = str_replace('Basic ', '', $auth);
//        $creds = explode(':', $hash);
//        echo json_encode($creds); die();
        \Debugbar::disable();
        return \Auth::onceBasic() ?: $next($request);
    }
}
