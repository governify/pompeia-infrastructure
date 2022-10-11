listen {
  port = 4040
  address = "0.0.0.0"
  metrics_endpoint = "/metrics"
}

namespace "assets" {
  format = "[$time_local] \"$request\" => $status in $request_time seconds"
  source_files = ["/mnt/nginxlogs/assets.access.log"]
  labels {
    app = "pompeia-assets"
  }
}
namespace "dashboard" {
  format = "[$time_local] \"$request\" => $status in $request_time seconds"
  source_files = ["/mnt/nginxlogs/dashboard.access.log"]
  labels {
    app = "pompeia-dashboard"
  }
}
namespace "director" {
  format = "[$time_local] \"$request\" => $status in $request_time seconds"
  source_files = ["/mnt/nginxlogs/director.access.log"]
  labels {
    app = "pompeia-director"
  }
}
namespace "join" {
  format = "[$time_local] \"$request\" => $status in $request_time seconds"
  source_files = ["/mnt/nginxlogs/join.access.log"]
  labels {
    app = "pompeia-join"
  }
}
namespace "registry" {
  format = "[$time_local] \"$request\" => $status in $request_time seconds"
  source_files = ["/mnt/nginxlogs/registry.access.log"]
  labels {
    app = "pompeia-registry"
  }
}
namespace "reporter" {
  format = "[$time_local] \"$request\" => $status in $request_time seconds"
  source_files = ["/mnt/nginxlogs/reporter.access.log"]
  labels {
    app = "pompeia-reporter"
  }
}
namespace "scopes" {
  format = "[$time_local] \"$request\" => $status in $request_time seconds"
  source_files = ["/mnt/nginxlogs/scopes.access.log"]
  labels {
    app = "pompeia-scopes"
  }
}
namespace "ui" {
  format = "[$time_local] \"$request\" => $status in $request_time seconds"
  source_files = ["/mnt/nginxlogs/ui.access.log"]
  labels {
    app = "pompeia-render"
  }
}