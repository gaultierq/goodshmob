package it.goodsh.mob;

import com.facebook.FacebookSdk;
import com.facebook.CallbackManager;
import com.facebook.appevents.AppEventsLogger;


import android.app.Application;
import android.content.Intent;

import com.facebook.react.ReactApplication;
import com.oblador.vectoricons.VectorIconsPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.controllers.ActivityCallbacks;

public class MainApplication extends NavigationApplication implements ReactApplication {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  @Override
  public boolean isDebug() {
    // Make sure you are using BuildConfig from your own application
    return BuildConfig.DEBUG;
  }

  protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new VectorIconsPackage(),
            new RNI18nPackage(),
            new FBSDKPackage(mCallbackManager)
    );
  }
//
//  @Override
//  public ReactNativeHost getReactNativeHost() {
//    return mReactNativeHost;
//  }

  @Override
  public void onCreate() {
    super.onCreate();


    // add this
    setActivityCallbacks(new ActivityCallbacks() {

      @Override
      public void onActivityResult(int requestCode, int resultCode, Intent data) {
        mCallbackManager.onActivityResult(requestCode, resultCode, data);
      }
    });

    FacebookSdk.sdkInitialize(this);
    SoLoader.init(this, /* native exopackage */ false);
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
      return getPackages();
  }
}
