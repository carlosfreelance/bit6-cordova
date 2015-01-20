package com.bit6.sdk;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;

import com.bit6.sdk.Address;
import com.bit6.sdk.Bit6;
import com.bit6.sdk.ResultCallback;
import com.bit6.sdk.Message;
import com.bit6.sdk.Message.Messages;

import android.database.Cursor;


/**
 * Bit6 Cordova plugin
 */
public class Bit6Plugin extends CordovaPlugin {

  static final String INIT = "init";
  static final String LOGIN = "login";
  static final String CONVERSATIONS = "conversations";
  static final String IS_CONNECTED = "isConnected";


  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

    if (action.equals(INIT)) {
      init();
      callbackContext.success();
      return true;
    }
    if (action.equals(LOGIN)) {
     login(args.getString(0), args.getString(1), callbackContext);
     return true;
   }
   if (action.equals(CONVERSATIONS)) {
     conversations(callbackContext);
     return true;
   }
   if (action.equals(IS_CONNECTED)) {
     isConnected(callbackContext);
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

void conversations(final CallbackContext callbackContext){
  try {
   JSONArray conversations = new JSONArray();
   Cursor cursor;
   cursor = Bit6.getInstance().getConversations();

   while (cursor.moveToNext()) {
     JSONObject item = new JSONObject();
     String userName = cursor.getString(cursor.getColumnIndex(Messages.OTHER));
     String content = cursor.getString(cursor.getColumnIndex(Messages.CONTENT));
     String stamp = cursor.getString(cursor.getColumnIndex(Messages.CREATED));

     item.put("title", userName);
     item.put("content", content);
     item.put("stamp", stamp);
     conversations.put(item);
   }
   JSONObject data = new JSONObject();
   data.put("conversations", conversations);

   callbackContext.success(data);
 }
 catch (JSONException e) {
  callbackContext.error("Error: " + e.getMessage());
 }
}


void isConnected(final CallbackContext callbackContext) {
  try {
    JSONObject response = new JSONObject();
    response.put("connected", Bit6.getInstance().isUserLoggedIn());
    callbackContext.success(response);
  }
  catch (JSONException e) {
    callbackContext.error("Error: " + e.getMessage());
  }
}

void init() {
 Context context= this.cordova.getActivity().getApplicationContext();

 int appResId = cordova.getActivity().getResources().getIdentifier("app_key", "string", cordova.getActivity().getPackageName());
 String apikey = cordova.getActivity().getString(appResId);

 Bit6.getInstance().init(context, apikey);
}
}
