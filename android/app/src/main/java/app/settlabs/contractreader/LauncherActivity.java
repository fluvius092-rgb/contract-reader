package app.settlabs.contractreader;

import android.net.Uri;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.browser.customtabs.CustomTabsIntent;

public class LauncherActivity extends AppCompatActivity {

    private static final String DEFAULT_URL = "https://settlabs.app/contract_reader/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        String url = DEFAULT_URL;

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
