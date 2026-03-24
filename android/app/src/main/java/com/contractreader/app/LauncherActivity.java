package com.contractreader.app;

import android.net.Uri;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.browser.customtabs.CustomTabsIntent;

/**
 * TWA ランチャーActivity
 * PWAをCustom Tabsで全画面表示する
 */
public class LauncherActivity extends AppCompatActivity {

    private static final String DEFAULT_URL = "https://contract-reader.vercel.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        String url = DEFAULT_URL;

        // intent からURLを取得（ディープリンク対応）
        if (getIntent() != null && getIntent().getData() != null) {
            url = getIntent().getData().toString();
        }

        CustomTabsIntent customTabsIntent = new CustomTabsIntent.Builder()
                .setShowTitle(false)
                .build();

        customTabsIntent.launchUrl(this, Uri.parse(url));
        finish();
    }
}
