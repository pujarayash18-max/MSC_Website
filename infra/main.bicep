// Azure Resource Provisioning Bicep Template for Microsoft Campus Club (MCC) Platform
@description('Location for all resources')
param location string = resourceGroup().location

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@description('App name prefix')
param appName string = 'mcc-platform'

var uniqueSuffix = uniqueString(resourceGroup().id)
var postgresServerName = '${appName}-db-${uniqueSuffix}'
var blobStorageName = '${appName}st${uniqueSuffix}'
var appInsightsName = '${appName}-insights-${uniqueSuffix}'
var swaName = '${appName}-swa-${uniqueSuffix}'

// 1. Azure Database for PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: postgresServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '15'
    storage: {
      storageSizeGB: 32
    }
  }
}

// 2. Azure Blob Storage
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: blobStorageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource mediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'blob-storage'
  properties: {
    publicAccess: 'None'
  }
}

// 3. Azure Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 30
  }
}

// 4. Azure Static Web Apps / App Service
resource swa 'Microsoft.Web/staticSites@2022-09-01' = {
  name: swaName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

output postgresHost string = postgresServer.properties.fullyQualifiedDomainName
output blobStorageConnectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output staticWebAppDefaultHostName string = swa.properties.defaultHostname
