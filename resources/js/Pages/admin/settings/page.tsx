"use client"

import { useState } from "react"
import { Save, RefreshCw, Globe, Bell, Database, Upload, Download, Trash2, AlertTriangle } from "lucide-react"
import AdminPageLayout from "../layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Switch } from "@/Components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Textarea } from "@/Components/ui/textarea"
import { Slider } from "@/Components/ui/slider"
import { Badge } from "@/Components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: "Telesandi",
    siteDescription: "Learning Management System for educational institutions",
    contactEmail: "admin@telesandi.com",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    language: "en",
    enableRegistration: true,
    requireEmailVerification: true,
    enablePasswordReset: true,
    sessionTimeout: 60,
    maxUploadSize: 50,
    allowedFileTypes: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png,.mp4,.mp3",
    enableNotifications: true,
    emailNotifications: true,
    pushNotifications: false,
    maintenanceMode: false,
    debugMode: false,
    analyticsEnabled: true,
    backupFrequency: "daily",
    retentionPeriod: 30,
  })

  const handleInputChange = (e : any) => {
    const { name, value } = e.target
    setSettings({
      ...settings,
      [name]: value,
    })
  }

  const handleSwitchChange = (name : any, checked : any) => {
    setSettings({
      ...settings,
      [name]: checked,
    })
  }

  const handleSliderChange = (name : any, value : any) => {
    setSettings({
      ...settings,
      [name]: value[0],
    })
  }

  const handleSaveSettings = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
    }, 1500)
  }

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
              System Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Configure system-wide settings and preferences</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsResetDialogOpen(true)}>
              <RefreshCw className="w-4 h-4" />
              <span>Reset Defaults</span>
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-md rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Manage all system settings and configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-1 mb-6 md:grid-cols-3">
                <TabsTrigger value="general" className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span className="hidden md:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-1">
                  <Bell className="w-4 h-4" />
                  <span className="hidden md:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  <span className="hidden md:inline">Maintenance</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input id="siteName" name="siteName" value={settings.siteName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      name="siteDescription"
                      value={settings.siteDescription}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => handleInputChange({ target: { name: "timezone", value } })}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                        <SelectItem value="CST">Central Time (CST)</SelectItem>
                        <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                        <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) => handleInputChange({ target: { name: "dateFormat", value } })}
                    >
                      <SelectTrigger id="dateFormat">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => handleInputChange({ target: { name: "language", value } })}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableNotifications">Enable Notifications</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">System-wide notification settings</p>
                    </div>
                    <Switch
                      id="enableNotifications"
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => handleSwitchChange("enableNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Send notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      disabled={!settings.enableNotifications}
                      onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Send browser push notifications</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      disabled={!settings.enableNotifications}
                      onCheckedChange={(checked) => handleSwitchChange("pushNotifications", checked)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notificationTypes">Default Notification Events</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notif-course" className="rounded" defaultChecked />
                        <label htmlFor="notif-course" className="text-sm">
                          Course updates
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notif-assignment" className="rounded" defaultChecked />
                        <label htmlFor="notif-assignment" className="text-sm">
                          Assignment deadlines
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notif-grade" className="rounded" defaultChecked />
                        <label htmlFor="notif-grade" className="text-sm">
                          Grade postings
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notif-announcement" className="rounded" defaultChecked />
                        <label htmlFor="notif-announcement" className="text-sm">
                          System announcements
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notif-message" className="rounded" defaultChecked />
                        <label htmlFor="notif-message" className="text-sm">
                          Direct messages
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenanceMode" className="flex items-center gap-2">
                        Maintenance Mode
                        {settings.maintenanceMode && <Badge className="bg-amber-600">Active</Badge>}
                      </Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Site will be inaccessible to regular users
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleSwitchChange("maintenanceMode", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="debugMode">Debug Mode</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Show detailed error messages</p>
                    </div>
                    <Switch
                      id="debugMode"
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => handleSwitchChange("debugMode", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analyticsEnabled">Enable Analytics</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Collect usage data for reports</p>
                    </div>
                    <Switch
                      id="analyticsEnabled"
                      checked={settings.analyticsEnabled}
                      onCheckedChange={(checked) => handleSwitchChange("analyticsEnabled", checked)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select
                      value={settings.backupFrequency}
                      onValueChange={(value) => handleInputChange({ target: { name: "backupFrequency", value } })}
                    >
                      <SelectTrigger id="backupFrequency">
                        <SelectValue placeholder="Select backup frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="retentionPeriod">Data Retention (days)</Label>
                      <span className="text-sm font-medium">{settings.retentionPeriod} days</span>
                    </div>
                    <Slider
                      id="retentionPeriod"
                      min={7}
                      max={365}
                      step={1}
                      value={[settings.retentionPeriod]}
                      onValueChange={(value) => handleSliderChange("retentionPeriod", value)}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>7 days</span>
                      <span>1 year</span>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-1">
                        <Download className="w-4 h-4" />
                        <span>Backup Now</span>
                      </Button>
                      <Button variant="outline" className="flex-1 gap-1">
                        <Upload className="w-4 h-4" />
                        <span>Restore</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              className="gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Cache</span>
            </Button>
            <Button className="gap-1 bg-blue-600 hover:bg-blue-700" onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset to Default Settings</DialogTitle>
              <DialogDescription>
                This will reset all system settings to their default values. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Warning</h4>
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                      Resetting settings will affect all users and may disrupt active sessions. Consider backing up
                      your current configuration first.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => setIsResetDialogOpen(false)}>
                Reset All Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPageLayout>
  )
}
