package com.bit6.sdk;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.bit6.sdk.Address;
import com.bit6.sdk.Bit6;
import com.bit6.sdk.ResultCallback;
import android.widget.Toast;
import java.lang.Throwable;


/**
 * Bit6 Cordova plugin
 */
public class Bit6Plugin extends CordovaPlugin {

  static final String INIT = "init";

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

    if (action.equals("init")) {
      init();
      callbackContext.success();
      return true;
    }
    if (action.equals("login")) {
     login(args.getString(0), args.getString(1), callbackContext);
     return true;
   }

   return false;
 }

 void login(String username, String pass, final CallbackContext callbackContext) {

  Address identity = Address.fromParts(Address.KIND_USERNAME, username);

  Bit6.getInstance().login(identity, pass, new ResultCallback() {
    @Override
    public void onResult(boolean success, String msg) {
      if (success) {
        callbackContext.success(msg);
      }
      else {
        callbackContext.error(msg);
      }
    }
  });
}

void init() {
 Context context= this.cordova.getActivity().getApplicationContext();

 int appResId = cordova.getActivity().getResources().getIdentifier("app_key", "string", cordova.getActivity().getPackageName());
 String apikey = cordova.getActivity().getString(appResId);

 Bit6.getInstance().init(context, apikey);
}
}
