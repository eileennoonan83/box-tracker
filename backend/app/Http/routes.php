<?php

/**
 * API Service layer
 */
Route::group(array('prefix' => 'api', 'middleware' => 'auth'), function() {
 
    Route::group(['prefix' => 'customers'], function() {

        Route::group(['prefix' => '/{customer}/freeBoxProgram'], function() {
            Route::get('/', ['as' => 'api.customer.freeBoxProgram.show', 'uses' => 'CustomerFreeBoxApiController@show']);

        });

        Route::group(['prefix' => '/{customer}/activity'], function() {
            Route::get('/', [
                'as' => 'api.customer.activity.index',
                'uses' => 'CustomerActivityApiController@index'
            ]);
        });
    });

    Route::group(['prefix' => 'freeBox'], function() {
        Route::group(['prefix' => "/{freeBox}"], function() {
            Route::patch('/clearUnreturned', [
                'as' => 'api.free_box.clear_unreturned',
                'uses' => 'FreeBoxApiController@clearUnreturned']
            );

            Route::group(['prefix' => '/activity'], function() {
                Route::get('/', [
                    'as' => 'api.free_box.activity.index',
                    'uses' => 'FreeBoxActivityApiController@index'
                ]);
            });
        });
    });
});

/**
 * Box Tracker App Routes
 */
Route::group(['prefix' => 'api/boxTracker', 'middleware' => 'auth.basic.once'], function() {

    Route::post("/signature", function() {
        $files = request()->files->all();
        return response()->json(['files'=> json_encode($files)]);
    });

    Route::any('/auth', [
        'as' => 'api.box_tracker.auth',
        'uses' => 'BoxTrackerApiController@auth'
    ]);

    Route::group(['prefix' => '/freeBox/{freeBox}'], function() {
        Route::get('/', [
            'as' => 'api.box_tracker.free_box.show',
            'uses' => 'FreeBoxApiController@show'
        ]);

        Route::patch('/pickup', [
            'as' => 'api.box_tracker.free_box.pickup_boxes',
            'uses' => 'FreeBoxApiController@pickupBoxes'
        ]);

        Route::patch('/return', [
            'as' => 'api.box_tracker.free_box.return_boxes',
            'uses' => 'FreeBoxApiController@returnBoxes'
        ]);

        Route::patch('/clearUnreturned', [
            'as' => 'api.box_tracker.free_box.clear_unreturned',
            'uses' => 'FreeBoxApiController@clearUnreturned'
        ]);
    });

    Route::group(['prefix' => "/customer"], function() {

        Route::get('/searchGetBoxes', [
            'as' => 'api.box_tracker.customer_search_get_boxes',
            'uses' => 'BoxTrackerSearchApiController@customerSearchGetBoxes'
        ]);

        Route::get('/searchReturnBoxes', [
            'as' => 'api.box_tracker.customer_search_return_boxes',
            'uses' => 'BoxTrackerSearchApiController@customerSearchReturnBoxes'
        ]);

        Route::group(['prefix' => '/{customer}/creditCard'], function() {
            Route::post('/', [
                'as' => 'api.box_tracker.customer.credit_card.store',
                'uses' => 'CustomerCreditCardApiController@store'
            ]);

            Route::get('/likelyBillingAddress', [
                'as' => 'api.box_tracker.customer.credit_card.likely_billing_address',
                'uses' => 'CustomerCreditCardApiController@likelyBillingAddress'
            ]);
        });

    });


    Route::group(['prefix' => '/freeBox'], function () {
        Route::group(['prefix' => '/{freeBox}'], function() {

            Route::patch('/returnBoxes', [
                'as' => 'api.box_tracker.free_box.return_boxes',
                'uses' => 'FreeBoxApiController@returnBoxes'
            ]);

            Route::post("/{transactionType}/{paymentMethod}/{creditCard?}", [
                'as' => 'api.box_tracker.free_box.run_transaction',
                'uses' => 'FreeBoxApiController@runTransaction'
            ])->where(['transactionType' => '(deposit|refund)', 'paymentMethod' => '(creditCard|cash)']);

        });

    });

    Route::group(['prefix' => "/customer/{customer}"], function() {

        Route::get('/getPickUpBoxes', [
            'as' => 'api.box_tracker.get_pick_up',
            'uses' => 'CustomerFreeBoxApiController@getPickUpBoxes'
        ]);

        Route::get('/getReturnBoxes', [
            'as' => 'api.box_tracker.get_return',
            'uses' => 'CustomerFreeBoxApiController@getReturnBoxes'
        ]);
    });
});