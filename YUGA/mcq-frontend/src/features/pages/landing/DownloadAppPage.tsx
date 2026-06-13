import React from "react";
import { Smartphone } from "lucide-react";
import { trackButtonClick } from "../../../core/utils/analytics";

const ANDROID_EXPO_INSTALL_URL =
  "https://expo.dev/accounts/navodhan-yuga/projects/yuga-ai/builds/fc0386ee-aee3-432d-9ea2-8597a606b2f5";

export const DownloadAppPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-3xl px-4">
        <div className="modern-card-glass p-7 md:p-10 rounded-2xl shadow-premium">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-purple-600/15 flex items-center justify-center border border-purple-500/20">
              <Smartphone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Download the YUGA AI App
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
                Choose your platform. On Android, you’ll open the Expo install page.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href={ANDROID_EXPO_INSTALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gradient w-full inline-flex items-center justify-center"
              onClick={() => trackButtonClick("Download Android App", "DownloadPage")}
            >
              Install Android
            </a>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-[#0f172a]/40 p-4">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                If your phone blocks the installation, allow installation from unknown apps for your browser/Files
                app, then try again.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Tip: For best results, use a real Android device (not only emulator).
        </div>
      </div>
    </div>
  );
};

