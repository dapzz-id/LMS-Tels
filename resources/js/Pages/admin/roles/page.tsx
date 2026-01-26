"use client"

import { useState } from "react"
import {
  ShieldCheck,
  Plus,
  Search,
  MoreHorizontal,
  Check,
  X,
  Edit,
  Trash2,
  ChevronRight,
  Eye,
  Lock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { Checkbox } from "@/Components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import AdminPageLayout from "../layout"

// Sample role data
const roles = [
  {
    id: 1,
    name: "Administrator",
    description: "Full system access with all permissions",
    users: 10,
    isSystem: true,
    permissions: {
      users: { view: true, create: true, edit: true, delete: true },
      courses: { view: true, create: true, edit: true, delete: true },
      content: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: true, edit: true, delete: true },
      billing: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: 2,
    name: "Teacher",
    description: "Can create and manage courses and assignments",
    users: 156,
    isSystem: true,
    permissions: {
      users: { view: true, create: false, edit: false, delete: false },
      courses: { view: true, create: true, edit: true, delete: false },
      content: { view: true, create: true, edit: true, delete: true },
      settings: { view: false, create: false, edit: false, delete: false },
      billing: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 3,
    name: "Student",
    description: "Can access courses and submit assignments",
    users: 1024,
    isSystem: true,
    permissions: {
      users: { view: false, create: false, edit: false, delete: false },
      courses: { view: true, create: false, edit: false, delete: false },
      content: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
      billing: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 4,
    name: "Teaching Assistant",
    description: "Can grade assignments and help manage courses",
    users: 42,
    isSystem: false,
    permissions: {
      users: { view: true, create: false, edit: false, delete: false },
      courses: { view: true, create: false, edit: true, delete: false },
      content: { view: true, create: true, edit: true, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
      billing: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 5,
    name: "Subject Head",
    description: "Can oversee teachers and courses in their subject",
    users: 16,
    isSystem: false,
    permissions: {
      users: { view: true, create: true, edit: true, delete: false },
      courses: { view: true, create: true, edit: true, delete: true },
      content: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: false, edit: false, delete: false },
      billing: { view: true, create: false, edit: false, delete: false },
    },
  },
]

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState(roles[0])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AdminPageLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
              Roles & Permissions
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Manage user roles and access control</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  <span>Create Role</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>Define a new role with specific permissions</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid items-center grid-cols-4 gap-4">
                    <label htmlFor="name" className="text-sm font-medium text-right">
                      Role Name
                    </label>
                    <Input id="name" placeholder="Enter role name" className="col-span-3" />
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <label htmlFor="description" className="text-sm font-medium text-right">
                      Description
                    </label>
                    <Input id="description" placeholder="Enter role description" className="col-span-3" />
                  </div>
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium">Permissions</h4>
                    <div className="overflow-hidden border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Module</TableHead>
                            <TableHead className="text-center">View</TableHead>
                            <TableHead className="text-center">Create</TableHead>
                            <TableHead className="text-center">Edit</TableHead>
                            <TableHead className="text-center">Delete</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {["Users", "Courses", "Content", "Settings", "Billing"].map((module) => (
                            <TableRow key={module}>
                              <TableCell className="font-medium">{module}</TableCell>
                              <TableCell className="text-center">
                                <Checkbox />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDialogOpen(false)}>
                    Create Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Role List</CardTitle>
                  <div className="relative w-full max-w-[180px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                      placeholder="Search roles..."
                      className="pl-8 rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-2 space-y-1">
                  {filteredRoles.map((role) => (
                    <div
                      key={role.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        selectedRole.id === role.id ? "bg-blue-50 dark:bg-blue-950" : ""
                      }`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            role.isSystem ? "bg-purple-100 dark:bg-purple-900" : "bg-blue-100 dark:bg-blue-900"
                          }`}
                        >
                          <ShieldCheck
                            className={`h-4 w-4 ${
                              role.isSystem ? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{role.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{role.users} users</p>
                        </div>
                      </div>
                      {role.isSystem && (
                        <Badge
                          variant="outline"
                          className="text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400"
                        >
                          System
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 md:col-span-2">
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedRole.name}</CardTitle>
                    <CardDescription>{selectedRole.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedRole.isSystem ? (
                      <Badge
                        variant="outline"
                        className="text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400"
                      >
                        System Role
                      </Badge>
                    ) : (
                      <>
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Edit Role</DialogTitle>
                              <DialogDescription>Modify role details and permissions</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid items-center grid-cols-4 gap-4">
                                <label htmlFor="edit-name" className="text-sm font-medium text-right">
                                  Role Name
                                </label>
                                <Input id="edit-name" defaultValue={selectedRole.name} className="col-span-3" />
                              </div>
                              <div className="grid items-center grid-cols-4 gap-4">
                                <label htmlFor="edit-description" className="text-sm font-medium text-right">
                                  Description
                                </label>
                                <Input
                                  id="edit-description"
                                  defaultValue={selectedRole.description}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="mt-4">
                                <h4 className="mb-2 text-sm font-medium">Permissions</h4>
                                <div className="overflow-hidden border rounded-lg">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[200px]">Module</TableHead>
                                        <TableHead className="text-center">View</TableHead>
                                        <TableHead className="text-center">Create</TableHead>
                                        <TableHead className="text-center">Edit</TableHead>
                                        <TableHead className="text-center">Delete</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {Object.entries(selectedRole.permissions).map(([module, perms]) => (
                                        <TableRow key={module}>
                                          <TableCell className="font-medium">
                                            {module.charAt(0).toUpperCase() + module.slice(1)}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            <Checkbox defaultChecked={perms.view} />
                                          </TableCell>
                                          <TableCell className="text-center">
                                            <Checkbox defaultChecked={perms.create} />
                                          </TableCell>
                                          <TableCell className="text-center">
                                            <Checkbox defaultChecked={perms.edit} />
                                          </TableCell>
                                          <TableCell className="text-center">
                                            <Checkbox defaultChecked={perms.delete} />
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setIsEditDialogOpen(false)}
                              >
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Role</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this role? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                There are currently <span className="font-semibold">{selectedRole.users} users</span> with
                                this role. You'll need to reassign them to another role before deleting.
                              </p>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => setIsDeleteDialogOpen(false)}
                              >
                                Delete Role
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="permissions">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="users">Assigned Users</TabsTrigger>
                  </TabsList>
                  <TabsContent value="permissions" className="space-y-4">
                    <div className="overflow-hidden border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Module</TableHead>
                            <TableHead className="text-center">View</TableHead>
                            <TableHead className="text-center">Create</TableHead>
                            <TableHead className="text-center">Edit</TableHead>
                            <TableHead className="text-center">Delete</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(selectedRole.permissions).map(([module, perms]) => (
                            <TableRow key={module}>
                              <TableCell className="font-medium">
                                {module.charAt(0).toUpperCase() + module.slice(1)}
                              </TableCell>
                              <TableCell className="text-center">
                                {perms.view ? (
                                  <Check className="w-5 h-5 mx-auto text-green-600" />
                                ) : (
                                  <X className="w-5 h-5 mx-auto text-red-600" />
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {perms.create ? (
                                  <Check className="w-5 h-5 mx-auto text-green-600" />
                                ) : (
                                  <X className="w-5 h-5 mx-auto text-red-600" />
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {perms.edit ? (
                                  <Check className="w-5 h-5 mx-auto text-green-600" />
                                ) : (
                                  <X className="w-5 h-5 mx-auto text-red-600" />
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {perms.delete ? (
                                  <Check className="w-5 h-5 mx-auto text-green-600" />
                                ) : (
                                  <X className="w-5 h-5 mx-auto text-red-600" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Permission Notes</h4>
                          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                            {selectedRole.isSystem
                              ? "This is a system role with predefined permissions. Some restrictions cannot be modified to maintain system integrity."
                              : "Custom roles can be fully configured. Remember that users will inherit all permissions from their assigned role."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="users" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing <span className="font-medium">{selectedRole.users}</span> users with this role
                      </p>
                      <div className="relative w-full max-w-[220px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <Input placeholder="Search users..." className="pl-8 rounded-lg" />
                      </div>
                    </div>

                    <div className="overflow-hidden border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...Array(Math.min(5, selectedRole.users))].map((_, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800">
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                      {selectedRole.name === "Administrator"
                                        ? "AD"
                                        : selectedRole.name === "Teacher"
                                          ? "TC"
                                          : selectedRole.name === "Student"
                                            ? "ST"
                                            : selectedRole.name === "Teaching Assistant"
                                              ? "TA"
                                              : "DH"}
                                    </span>
                                  </div>
                                  <span>
                                    {selectedRole.name === "Administrator"
                                      ? "John Admin"
                                      : selectedRole.name === "Teacher"
                                        ? "Sarah Teacher"
                                        : selectedRole.name === "Student"
                                          ? "Mike Student"
                                          : selectedRole.name === "Teaching Assistant"
                                            ? "Lisa Assistant"
                                            : "David Head"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {selectedRole.name === "Administrator"
                                  ? "admin@example.com"
                                  : selectedRole.name === "Teacher"
                                    ? "teacher@example.com"
                                    : selectedRole.name === "Student"
                                      ? "student@example.com"
                                      : selectedRole.name === "Teaching Assistant"
                                        ? "assistant@example.com"
                                        : "head@example.com"}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" />
                                      <span>Change Role</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Eye className="w-4 h-4 mr-2" />
                                      <span>View Details</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {selectedRole.users > 5 && (
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" className="gap-1">
                          <span>View All Users</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  )
}
