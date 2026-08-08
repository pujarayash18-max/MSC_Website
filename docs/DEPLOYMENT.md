# MCC Platform — Azure Deployment & Operations Guide

Comprehensive guide for deploying and operating the Microsoft Campus Club (MCC) Platform on **Microsoft Azure**.

---

## 1. Prerequisites
- Azure Subscription
- GitHub Repository (`pujarayash18-max/MSC_Website`)
- Azure CLI / Bicep CLI

---

## 2. Infrastructure Provisioning via Bicep

The repository contains `infra/main.bicep` to provision all required Azure resources:

```bash
az deployment group create \
  --resource-group rg-mcc-platform \
  --template-file infra/main.bicep \
  --parameters location=eastus
```

### Provisioned Resources:
1. **Azure Static Web Apps**: Hosts Next.js frontend with global CDN edge distribution.
2. **Azure Cosmos DB**: Multi-region serverless database with automatic backups.
3. **Azure Blob Storage**: Stores event media, certificates, and resource attachments.
4. **Azure Functions**: Serverless TypeScript backend logic.
5. **Azure SignalR Service**: Powers real-time student dashboard updates.
6. **Azure Application Insights**: APM performance monitoring and logging.

---

## 3. Automated CI/CD Workflow

Deployment is fully automated using GitHub Actions via `.github/workflows/azure-static-web-apps.yml`.

Pushing changes to `main` automatically builds and deploys the application:

```bash
git add .
git commit -m "Deploy production update"
git push origin main
```
