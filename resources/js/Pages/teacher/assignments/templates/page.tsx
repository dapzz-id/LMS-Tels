/* import { Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, FileText, Calendar, Users, CheckCircle2, XCircle } from "lucide-react";

export default function AssignmentTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
            Assignment Templates
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and reuse assignment templates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/20">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="w-full bg-white dark:bg-slate-900 pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-12 rounded-xl border-slate-200 dark:border-slate-800">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="rounded-xl shadow-md border-0">
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>View and manage your assignment templates</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      {template.title}
                    </div>
                  </TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      {template.lastUsed}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={template.status === "Active" ? "default" : "secondary"}
                      className="rounded-full"
                    >
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                        <DropdownMenuItem className="rounded-lg cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer">
                          <FileText className="mr-2 h-4 w-4" />
                          Use Template
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400 rounded-lg cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Template
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const templates = [
  {
    id: "1",
    title: "Research Paper Template",
    category: "Writing",
    lastUsed: "May 15, 2024",
    status: "Active",
  },
  {
    id: "2",
    title: "Programming Assignment",
    category: "Coding",
    lastUsed: "June 10, 2024",
    status: "Active",
  },
  {
    id: "3",
    title: "Group Project",
    category: "Collaboration",
    lastUsed: "April 30, 2024",
    status: "Active",
  },
];
*/
