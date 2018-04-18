package it.goodsh.mob;

import com.crashlytics.android.Crashlytics;
import com.facebook.FacebookSdk;
import com.facebook.CallbackManager;
import com.facebook.appevents.AppEventsLogger;


import android.app.Application;
import android.content.Intent;

import com.facebook.react.ReactApplication;
import com.krazylabs.OpenAppSettingsPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.horcrux.svg.SvgPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.clipsub.rnbottomsheet.RNBottomSheetPackage;
import com.smixx.fabric.FabricPackage;

import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import io.fabric.sdk.android.Fabric;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import ui.taptargetview.RNTapTargetViewPackage;

import com.bugsnag.BugsnagReactNative;
import com.azendoo.reactnativesnackbar.SnackbarPackage;
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
            new OpenAppSettingsPackage(),
            new RNSpinkitPackage(),
            new SvgPackage(),
            new RNFetchBlobPackage(),
            new RNBottomSheetPackage(),
            new FabricPackage(),
            new RNTapTargetViewPackage(),
            new ReactNativeConfigPackage(),
            new RNDeviceInfo(),
            new RNFirebasePackage(),
            new RNFirebaseMessagingPackage(),
            BugsnagReactNative.getPackage(),
            new SnackbarPackage(),
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

//  @Override
//  public String getJSBundleFile() {
//    return CodePush.getJSBundleFile();
//  }

  @Override
  public void onCreate() {
    super.onCreate();
    Fabric.with(this, new Crashlytics());


    // add this
    setActivityCallbacks(new ActivityCallbacks() {

      @Override
      public void onActivityResult(int requestCode, int resultCode, Intent data) {
        mCallbackManager.onActivityResult(requestCode, resultCode, data);
      }
    });

    FacebookSdk.sdkInitialize(this);
    BugsnagReactNative.start(this);

    SoLoader.init(this, /* native exopackage */ false);
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
      return getPackages();
  }
}
