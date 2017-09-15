package it.goodsh.mob;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import com.reactnativenavigation.controllers.SplashActivity;

public class MainActivity extends SplashActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
    @Override
    protected String getMainComponentName() {
        return "goodshmob";
    }
    */

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }
}
