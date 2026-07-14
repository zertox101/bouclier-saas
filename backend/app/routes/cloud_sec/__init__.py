from fastapi import APIRouter

router = APIRouter(prefix="/api/cloud-security", tags=["cloud-security"])

PROVIDERS = {
    "aws": {"name": "Amazon Web Services", "status": "connected", "account": "1234-5678-9012", "region": "us-east-1", "last_scan": "2026-06-30T10:00:00Z", "resources": 156, "findings": {"critical": 3, "high": 12, "medium": 28, "low": 45}},
    "azure": {"name": "Microsoft Azure", "status": "connected", "tenant": "contoso.onmicrosoft.com", "subscription": "sub-abc123", "last_scan": "2026-06-30T09:30:00Z", "resources": 89, "findings": {"critical": 1, "high": 8, "medium": 15, "low": 22}},
    "gcp": {"name": "Google Cloud Platform", "status": "disconnected", "project": "N/A", "last_scan": "N/A", "resources": 0, "findings": {}},
}

COMPLIANCE_CHECKS = [
    {"id": "CIS-1.1", "title": "Avoid root user usage", "provider": "aws", "status": "fail", "severity": "critical"},
    {"id": "CIS-1.2", "title": "Enable MFA for root user", "provider": "aws", "status": "fail", "severity": "critical"},
    {"id": "CIS-1.3", "title": "Rotate access keys regularly", "provider": "aws", "status": "pass", "severity": "high"},
    {"id": "CIS-2.1", "title": "S3 buckets should be private", "provider": "aws", "status": "fail", "severity": "high"},
    {"id": "CIS-2.2", "title": "Enable S3 bucket logging", "provider": "aws", "status": "pass", "severity": "medium"},
    {"id": "CIS-3.1", "title": "Security groups should restrict ingress", "provider": "aws", "status": "fail", "severity": "high"},
    {"id": "CIS-3.2", "title": "Enable VPC flow logs", "provider": "aws", "status": "fail", "severity": "medium"},
    {"id": "CIS-4.1", "title": "Enable CloudTrail in all regions", "provider": "aws", "status": "pass", "severity": "high"},
    {"id": "CIS-4.2", "title": "Ensure S3 bucket for CloudTrail is encrypted", "provider": "aws", "status": "pass", "severity": "medium"},
    {"id": "CIS-5.1", "title": "Configure security contact information", "provider": "aws", "status": "fail", "severity": "low"},
]

AWS_ASSESSMENT = {
    "summary": {"total_resources": 156, "critical": 3, "high": 12, "medium": 28, "low": 45, "compliance_score": 62},
    "findings": [
        {"id": "AWS-001", "title": "S3 Bucket Publicly Accessible", "resource": "s3://backups-prod", "severity": "critical", "status": "open", "description": "Bucket 'backups-prod' allows public LIST/GET access", "remediation": "Block public access via S3 Block Public Access settings"},
        {"id": "AWS-002", "title": "IAM Root User Active", "resource": "Root (1234-5678-9012)", "severity": "critical", "status": "open", "description": "Root account has active access keys", "remediation": "Delete root access keys and use IAM roles"},
        {"id": "AWS-003", "title": "Unrestricted SSH Access", "resource": "sg-web-01", "severity": "high", "status": "open", "description": "Security group allows SSH (22/TCP) from 0.0.0.0/0", "remediation": "Restrict SSH access to known IP ranges"},
        {"id": "AWS-004", "title": "Unencrypted RDS Instance", "resource": "db-prod-01", "severity": "high", "status": "open", "description": "RDS instance is not encrypted at rest", "remediation": "Enable RDS encryption via snapshot copy"},
        {"id": "AWS-005", "title": "Overly Permissive IAM Role", "resource": "role/ci-deploy", "severity": "high", "status": "open", "description": "IAM role has AdministratorAccess policy attached", "remediation": "Apply least privilege principle"},
        {"id": "AWS-006", "title": "CloudTrail Not Enabled", "resource": "us-west-2", "severity": "high", "status": "open", "description": "CloudTrail is disabled in us-west-2 region", "remediation": "Enable CloudTrail in all regions"},
        {"id": "AWS-007", "title": "No MFA on Console Users", "resource": "iam/user/deployer", "severity": "high", "status": "open", "description": "User does not have MFA enabled", "remediation": "Enforce MFA for all console users"},
        {"id": "AWS-008", "title": "EC2 Instance Exposed (RDP)", "resource": "i-0abc1234def56789", "severity": "medium", "status": "open", "description": "EC2 allows RDP (3389/TCP) from the internet", "remediation": "Restrict RDP to bastion host only"},
        {"id": "AWS-009", "title": "Unused Security Group", "resource": "sg-legacy-01", "severity": "low", "status": "open", "description": "Security group not associated with any resource", "remediation": "Remove unused security groups"},
        {"id": "AWS-010", "title": "Default VPC in Use", "resource": "vpc-default", "severity": "medium", "status": "open", "description": "Resources are deployed in the default VPC", "remediation": "Migrate to custom VPC"},
    ],
}

AZURE_ASSESSMENT = {
    "summary": {"total_resources": 89, "critical": 1, "high": 8, "medium": 15, "low": 22, "compliance_score": 74},
    "findings": [
        {"id": "AZ-001", "title": "Storage Account Public Access", "resource": "stproddatalake", "severity": "critical", "status": "open", "description": "Storage account allows anonymous blob access", "remediation": "Disable anonymous access on all containers"},
        {"id": "AZ-002", "title": "Key Vault Firewall Disabled", "resource": "kv-prod-01", "severity": "high", "status": "open", "description": "Key Vault allows public network access", "remediation": "Enable Key Vault firewall and restrict to trusted services"},
        {"id": "AZ-003", "title": "NSG Open to Internet", "resource": "nsg-app-01", "severity": "high", "status": "open", "description": "Network security group allows *:22 from internet", "remediation": "Restrict inbound SSH rules"},
    ],
}

GCP_ASSESSMENT = {
    "status": "disconnected",
    "message": "GCP project is not connected. Please authenticate with service account.",
}

@router.get("/status")
def get_status():
    return {"status": "operational", "providers_connected": 2, "total_findings": 134, "last_global_scan": "2026-06-30T10:00:00Z"}

@router.get("/providers")
def get_providers():
    return {"providers": PROVIDERS}

@router.get("/assessment/{provider}")
def get_assessment(provider: str):
    if provider == "aws":
        return AWS_ASSESSMENT
    elif provider == "azure":
        return AZURE_ASSESSMENT
    elif provider == "gcp":
        return GCP_ASSESSMENT
    return {"error": "Provider not found"}

@router.get("/compliance")
def get_compliance():
    passed = sum(1 for c in COMPLIANCE_CHECKS if c["status"] == "pass")
    failed = sum(1 for c in COMPLIANCE_CHECKS if c["status"] == "fail")
    return {"checks": COMPLIANCE_CHECKS, "passed": passed, "failed": failed, "total": len(COMPLIANCE_CHECKS)}

@router.post("/scan/{provider}")
def scan_provider(provider: str):
    if provider not in PROVIDERS:
        return {"error": "Provider not found"}
    return {"job_id": f"cloud-scan-{provider}-{id({provider})}", "status": "started", "provider": provider}
