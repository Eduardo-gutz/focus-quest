package expo.modules.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class UsageStatsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val usageStatsManager: UsageStatsManager
    get() = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

  private val appOpsManager: AppOpsManager
    get() = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager

  override fun definition() = ModuleDefinition {
    Name("UsageStats")

    Function("hasUsageStatsPermission") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
        return@Function false
      }
      val mode = appOpsManager.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        context.packageName
      )
      mode == AppOpsManager.MODE_ALLOWED
    }

    Function("requestUsageStatsPermission") {
      val activity = appContext.currentActivity
      if (activity == null) {
        throw Exceptions.ReactContextLost()
      }
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
      activity.startActivity(intent)
    }

    Function("getUsageStats") { startTime: Double, endTime: Double ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
        return@Function emptyList<Map<String, Any>>()
      }
      val usageStatsList = usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_BEST,
        startTime.toLong(),
        endTime.toLong()
      ) ?: return@Function emptyList<Map<String, Any>>()

      usageStatsList
        .filter { it.totalTimeInForeground > 0 }
        .map { stats ->
          mapOf(
            "packageName" to stats.packageName,
            "totalTimeInForeground" to stats.totalTimeInForeground
          )
        }
    }
  }
}
