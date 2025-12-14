"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, RefreshCw, Power, PowerOff, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { Switch } from "@/Components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import AdminPageLayout from "../layout"

// Sample integrations data
const integrations = [
  {
    id: 1,
    name: "Zoom",
    description: "Virtual classroom and video conferencing",
    category: "Communication",
    status: "connected",
    lastSync: "2 hours ago",
    icon: "🎥",
  },
  {
    id: 2,
    name: "Google Drive",
    description: "Cloud storage for course materials",
    category: "Storage",
    status: "connected",
    lastSync: "1 day ago",
    icon: "📁",
  },
  {
    id: 3,
    name: "Slack",
    description: "Team communication and collaboration",
    category: "Communication",
    status: "connected",
    lastSync: "3 hours ago",
    icon: "💬",
  },
  {
    id: 4,
    name: "GitHub",
    description: "Code repositories for programming courses",
    category: "Development",
    status: "connected",
    lastSync: "12 hours ago",
    icon: "💻",
  },
  {
    id: 5,
    name: "Stripe",
    description: "Payment processing for course fees",
    category: "Payments",
    status: "connected",
    lastSync: "5 days ago",
    icon: "💳",
  },
  {
    id: 6,
    name: "Mailchimp",
    description: "Email marketing and notifications",
    category: "Marketing",
    status: "disconnected",
    lastSync: "Never",
    icon: "📧",
  },
  {
    id: 7,
    name: "Canvas LMS",
    description: "Learning management system integration",
    category: "Education",
    status: "error",
    lastSync: "Failed 2 days ago",
    icon: "🎓",
  },
  {
    id: 8,
    name: "Microsoft Teams",
    description: "Team collaboration and virtual meetings",
    category: "Communication",
    status: "connected",
    lastSync: "1 hour ago",
    icon: "👥",
  },
]

// Available integrations to add
const availableIntegrations = [
  {
    id: 101,
    name: "Moodle",
    description: "Open-source learning platform",
    category: "Education",
    icon: "🎓",
  },
  {
    id: 102,
    name: "Discord",
    description: "Community chat and voice communication",
    category: "Communication",
    icon: "🎮",
  },
  {
    id: 103,
    name: "PayPal",
    description: "Online payment processing",
    category: "Payments",
    icon: "💰",
  },
  {
    id: 104,
    name: "AWS S3",
    description: "Cloud storage for large files",
    category: "Storage",
    icon: "☁️",
  },
]

type Integration = {
  id: number;
  name: string;
  description: string;
  category: string;
  status: string;
  lastSync: string;
  icon: string;
};


export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  const filteredIntegrations = integrations
    .filter(
      (integration) =>
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((integration) => {
      if (activeTab === "all") return true
      if (activeTab === "connected") return integration.status === "connected"
      if (activeTab === "disconnected") return integration.status === "disconnected"
      if (activeTab === "error") return integration.status === "error"
      return true
    })

  const handleConfigureIntegration = (integration: {
    id: number;
    name: string;
    description: string;
    category: string;
    status: string;
    lastSync: string;
    icon: string;
}) => {
    setSelectedIntegration(integration)
    setIsConfigDialogOpen(true)
  }

  return (
    <AdminPageLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
              Integrations
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Connect and manage third-party services</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  <span>Add Integration</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Integration</DialogTitle>
                  <DialogDescription>Connect a new third-party service to enhance your LMS</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input placeholder="Search available integrations..." className="pl-8 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {availableIntegrations.map((integration) => (
                      <Card
                        key={integration.id}
                        className="overflow-hidden transition-all border cursor-pointer rounded-xl border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-10 h-10 text-xl rounded-lg bg-slate-100 dark:bg-slate-800">
                              {integration.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{integration.name}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{integration.description}</p>
                              <Badge className="mt-2 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                                {integration.category}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                        <div className="px-4 pb-4">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">Connect</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-0 shadow-md rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Connected Services</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-full max-w-[220px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    placeholder="Search integrations..."
                    className="pl-8 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-[400px]">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="connected">Connected</TabsTrigger>
                    <TabsTrigger value="disconnected">Disconnected</TabsTrigger>
                    <TabsTrigger value="error">Error</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => (
                <Card
                  key={integration.id}
                  className={`rounded-xl overflow-hidden border ${
                    integration.status === "connected"
                      ? "border-green-200 dark:border-green-800"
                      : integration.status === "error"
                        ? "border-red-200 dark:border-red-800"
                        : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-10 h-10 text-xl rounded-lg bg-slate-100 dark:bg-slate-800">
                          {integration.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{integration.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{integration.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                              {integration.category}
                            </Badge>
                            {integration.status === "connected" && (
                              <Badge className="text-green-800 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800">
                                Connected
                              </Badge>
                            )}
                            {integration.status === "disconnected" && (
                              <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                                Disconnected
                              </Badge>
                            )}
                            {integration.status === "error" && (
                              <Badge className="text-red-800 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800">
                                Error
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleConfigureIntegration(integration)}>
                            <Edit className="w-4 h-4 mr-2" />
                            <span>Configure</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            <span>Sync Now</span>
                          </DropdownMenuItem>
                          {integration.status === "connected" ? (
                            <DropdownMenuItem>
                              <PowerOff className="w-4 h-4 mr-2" />
                              <span>Disconnect</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <Power className="w-4 h-4 mr-2" />
                              <span>Connect</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Last sync: {integration.lastSync}</p>
                    <div className="flex items-center">
                      <Switch checked={integration.status === "connected"} disabled={integration.status === "error"} />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Dialog */}
        {selectedIntegration && (
          <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Configure {selectedIntegration.name}</DialogTitle>
                <DialogDescription>Manage settings and permissions for this integration</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 text-xl rounded-lg bg-slate-100 dark:bg-slate-800">
                        {selectedIntegration.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedIntegration.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{selectedIntegration.category}</p>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        selectedIntegration.status === "connected"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : selectedIntegration.status === "error"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {selectedIntegration.status.charAt(0).toUpperCase() + selectedIntegration.status.slice(1)}
                    </Badge>
                  </div>

                  {selectedIntegration.status === "error" && (
                    <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Connection Error</h4>
                          <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                            Authentication token expired. Please reconnect to restore functionality.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Connection Settings</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400">API Key</label>
                            <Input type="password" value="••••••••••••••••" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400">API Secret</label>
                            <Input type="password" value="••••••••••••••••" className="mt-1" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 dark:text-slate-400">Webhook URL</label>
                          <div className="flex mt-1">
                            <Input value="https://lms-tels.com/api/webhooks/zoom" className="rounded-r-none" readOnly />
                            <Button variant="outline" className="border-l-0 rounded-l-none">
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-medium">Permissions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Read user data</label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Create meetings/sessions</label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Access course content</label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Send notifications</label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-medium">Sync Settings</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Auto-sync</label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Sync frequency</label>
                          <select className="px-3 py-1 text-sm border rounded-md border-slate-200 dark:border-slate-800">
                            <option>Every hour</option>
                            <option>Every 6 hours</option>
                            <option>Daily</option>
                            <option>Weekly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsConfigDialogOpen(false)}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminPageLayout>
  )
}

