from fastapi import APIRouter

router = APIRouter(prefix="/api/k8s-security", tags=["k8s-security"])

PODS = [
    {"name": "api-server-7d9f8c6b5-x4h2k", "namespace": "production", "status": "running", "privileged": True, "run_as_root": True, "host_network": True, "host_pid": False, "seccomp": "unconfined", "apparmor": "unconfined", "cpu_limit": "4", "memory_limit": "8Gi", "risk": "critical"},
    {"name": "nginx-ingress-controller-5c4d7c5b5-l9p3r", "namespace": "ingress-nginx", "status": "running", "privileged": False, "run_as_root": False, "host_network": True, "host_pid": False, "seccomp": "RuntimeDefault", "apparmor": "unconfined", "cpu_limit": "2", "memory_limit": "4Gi", "risk": "high"},
    {"name": "redis-master-0", "namespace": "cache", "status": "running", "privileged": False, "run_as_root": False, "host_network": False, "host_pid": False, "seccomp": "RuntimeDefault", "apparmor": "default", "cpu_limit": "1", "memory_limit": "2Gi", "risk": "low"},
    {"name": "database-postgresql-0", "namespace": "data", "status": "running", "privileged": False, "run_as_root": True, "host_network": False, "host_pid": False, "seccomp": "unconfined", "apparmor": "unconfined", "cpu_limit": "4", "memory_limit": "16Gi", "risk": "medium"},
    {"name": "kube-system/etcd-ip-10-0-1-100", "namespace": "kube-system", "status": "running", "privileged": False, "run_as_root": True, "host_network": True, "host_pid": False, "seccomp": "unconfined", "apparmor": "unconfined", "cpu_limit": "2", "memory_limit": "4Gi", "risk": "high"},
    {"name": "monitoring/prometheus-operator-5d7f4c5b5-x1y2z", "namespace": "monitoring", "status": "running", "privileged": False, "run_as_root": False, "host_network": False, "host_pid": False, "seccomp": "RuntimeDefault", "apparmor": "default", "cpu_limit": "2", "memory_limit": "4Gi", "risk": "low"},
    {"name": "logging/elasticsearch-master-0", "namespace": "logging", "status": "running", "privileged": False, "run_as_root": True, "host_network": False, "host_pid": False, "seccomp": "unconfined", "apparmor": "unconfined", "cpu_limit": "8", "memory_limit": "32Gi", "risk": "medium"},
    {"name": "storage/minio-operator-7f9d8c6b5-a2b3c", "namespace": "storage", "status": "running", "privileged": True, "run_as_root": True, "host_network": False, "host_pid": True, "seccomp": "unconfined", "apparmor": "unconfined", "cpu_limit": "4", "memory_limit": "8Gi", "risk": "critical"},
    {"name": "staging/debug-shell-8d9e0f1a2-b4c5d", "namespace": "staging", "status": "running", "privileged": True, "run_as_root": True, "host_network": True, "host_pid": True, "seccomp": "unconfined", "apparmor": "unconfined", "cpu_limit": "0", "memory_limit": "0", "risk": "critical"},
    {"name": "default/hello-world-6f8g7h5i4-j5k6l", "namespace": "default", "status": "running", "privileged": False, "run_as_root": False, "host_network": False, "host_pid": False, "seccomp": "RuntimeDefault", "apparmor": "default", "cpu_limit": "0.5", "memory_limit": "512Mi", "risk": "low"},
]

NAMESPACES = [
    {"name": "production", "status": "active", "network_policy": True, "pod_security_policy": True, "resource_quotas": True, "pod_count": 12, "risk": "medium"},
    {"name": "staging", "status": "active", "network_policy": True, "pod_security_policy": False, "resource_quotas": True, "pod_count": 8, "risk": "medium"},
    {"name": "default", "status": "active", "network_policy": False, "pod_security_policy": False, "resource_quotas": False, "pod_count": 3, "risk": "high"},
    {"name": "kube-system", "status": "active", "network_policy": False, "pod_security_policy": False, "resource_quotas": False, "pod_count": 15, "risk": "high"},
    {"name": "monitoring", "status": "active", "network_policy": True, "pod_security_policy": True, "resource_quotas": True, "pod_count": 6, "risk": "low"},
    {"name": "ingress-nginx", "status": "active", "network_policy": True, "pod_security_policy": False, "resource_quotas": True, "pod_count": 4, "risk": "medium"},
    {"name": "cache", "status": "active", "network_policy": True, "pod_security_policy": True, "resource_quotas": True, "pod_count": 3, "risk": "low"},
    {"name": "logging", "status": "active", "network_policy": False, "pod_security_policy": False, "resource_quotas": True, "pod_count": 5, "risk": "medium"},
]

RBAC_FINDINGS = [
    {"kind": "ClusterRole", "name": "cluster-admin-clusterrole", "subjects": ["system:serviceaccount:production:api-server"], "rules": ["*"], "risk": "critical", "description": "Service account has full cluster admin privileges"},
    {"kind": "ClusterRoleBinding", "name": "view-all", "subjects": ["system:serviceaccount:staging:debug-shell"], "rules": ["get", "list", "watch"], "risk": "high", "description": "Debug pod can view all resources across cluster"},
    {"kind": "RoleBinding", "name": "admin-ns-production", "subjects": ["user:devops@company.com"], "rules": ["*"], "risk": "high", "description": "User has full admin in production namespace"},
    {"kind": "Role", "name": "pod-creator", "subjects": ["system:serviceaccount:default:jenkins"], "rules": ["create", "delete", "patch"], "risk": "medium", "description": "CI/CD can create/delete pods in default namespace"},
]

NETWORK_POLICIES = [
    {"name": "deny-all-ingress", "namespace": "production", "policy_type": "ingress", "status": "enforced"},
    {"name": "allow-api-from-ingress", "namespace": "production", "policy_type": "ingress", "status": "enforced"},
    {"name": "allow-redis-from-api", "namespace": "cache", "policy_type": "ingress", "status": "enforced"},
    {"name": "default-deny-ingress", "namespace": "default", "policy_type": "ingress", "status": "missing"},
    {"name": "allow-prometheus-scrape", "namespace": "monitoring", "policy_type": "ingress", "status": "enforced"},
    {"name": "default-deny-all", "namespace": "kube-system", "policy_type": "both", "status": "missing"},
]

@router.get("/status")
def get_status():
    critical = sum(1 for p in PODS if p["risk"] == "critical")
    high = sum(1 for p in PODS if p["risk"] == "high")
    medium = sum(1 for p in PODS if p["risk"] == "medium")
    low = sum(1 for p in PODS if p["risk"] == "low")
    policies_missing = sum(1 for p in NETWORK_POLICIES if p["status"] == "missing")
    return {
        "status": "connected",
        "cluster_version": "v1.28.4",
        "nodes": 5,
        "pods_total": len(PODS),
        "findings": {"critical": critical, "high": high, "medium": medium, "low": low},
        "network_policies_missing": policies_missing,
    }

@router.get("/pods")
def get_pods():
    return {"pods": PODS, "total": len(PODS)}

@router.get("/namespaces")
def get_namespaces():
    return {"namespaces": NAMESPACES, "total": len(NAMESPACES)}

@router.get("/rbac")
def get_rbac():
    return {"findings": RBAC_FINDINGS, "total": len(RBAC_FINDINGS)}

@router.get("/network-policies")
def get_network_policies():
    enforced = sum(1 for p in NETWORK_POLICIES if p["status"] == "enforced")
    missing = sum(1 for p in NETWORK_POLICIES if p["status"] == "missing")
    return {"policies": NETWORK_POLICIES, "enforced": enforced, "missing": missing}

@router.post("/scan")
def trigger_scan():
    import time
    return {"job_id": f"k8s-scan-{int(time.time())}", "status": "started"}
