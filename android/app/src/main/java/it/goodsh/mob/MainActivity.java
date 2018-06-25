package it.goodsh.mob;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import com.reactnativenavigation.controllers.SplashActivity;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Shader;
import android.graphics.drawable.BitmapDrawable;
import android.os.Handler;
import android.support.annotation.Dimension;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.graphics.Color;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.view.Gravity;
import android.util.TypedValue;

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

        @Override
        public View createSplashLayout() {

            LinearLayout view = new LinearLayout(this);
            view.setGravity(Gravity.CENTER);
            view.setOrientation(LinearLayout.VERTICAL);
            view.setBackgroundColor(Color.parseColor("#01DEB1"));


            /*Bitmap bmp = BitmapFactory.decodeResource(getResources(), R.drawable.splash1);
            BitmapDrawable bitmapDrawable = new BitmapDrawable(bmp);
            bitmapDrawable.setTileModeXY(Shader.TileMode.REPEAT, Shader.TileMode.REPEAT);*/

            /*view.setBackgroundDrawable(bitmapDrawable);*/

            ImageView goodsh = new ImageView(this);
            goodsh.setImageResource(R.drawable.logo_white);
            //int width = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 180, getResources().getDisplayMetrics());

            goodsh.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));


            view.addView(goodsh);

            final ProgressBar progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleLarge);
            progressBar.setIndeterminate(true);
            progressBar.setVisibility(View.INVISIBLE);
            progressBar.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));

            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    progressBar.setVisibility(View.VISIBLE);
                }
            }, 1000);

            view.addView(progressBar, 150, 150);

            return view;
        }
}
