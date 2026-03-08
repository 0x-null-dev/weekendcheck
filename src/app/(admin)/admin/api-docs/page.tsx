export default function ApiDocsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-foreground mb-1">api docs</h1>
      <p className="text-xs font-mono text-muted mb-8">
        use these endpoints to manage projects programmatically. all admin endpoints require the auth cookie.
      </p>

      {/* Auth */}
      <Section title="authentication">
        <Endpoint method="POST" path="/api/admin/login" description="Login and get auth cookie">
          <CodeBlock>{`// Request body
{ "password": "your_admin_password" }

// Returns: sets wc_admin_token cookie (7 days)
// Response: { "ok": true }`}</CodeBlock>
        </Endpoint>
      </Section>

      {/* Projects */}
      <Section title="projects">
        <Endpoint method="GET" path="/api/admin/projects" description="List all projects">
          <CodeBlock>{`// Optional query params:
// ?status=in_queue | in_review | checked | archived

// Response: Project[]
[{
  "id": "proj-123",
  "slug": "my-project",
  "name": "My Project",
  "logoUrl": "https://...",
  "xHandle": "myhandle",
  "url": "https://myproject.com",
  "status": "in_queue",
  "upvotes": 42,
  "queueOrder": 0,
  ...
}]`}</CodeBlock>
        </Endpoint>

        <Endpoint method="POST" path="/api/admin/projects" description="Add a new project to the queue">
          <CodeBlock>{`// Request body (required: name, url, xHandle)
{
  "name": "My Project",
  "url": "https://myproject.com",
  "xHandle": "myhandle",
  "logoUrl": ""  // optional, auto-generates from url
}

// Response
{ "id": "proj-123", "slug": "my-project" }`}</CodeBlock>
        </Endpoint>

        <Endpoint method="GET" path="/api/admin/projects/:id" description="Get a single project">
          <CodeBlock>{`// Response: Project object`}</CodeBlock>
        </Endpoint>

        <Endpoint method="PATCH" path="/api/admin/projects/:id" description="Update project fields">
          <CodeBlock>{`// Request body (only send fields you want to update)
{
  "name": "New Name",
  "url": "https://new-url.com",
  "xHandle": "newhandle",
  "logoUrl": "https://...",
  "description": "...",
  "founderName": "...",
  "xProfilePic": "https://...",
  "githubUrl": "https://...",
  "xThreadUrl": "https://...",
  "tags": ["tag1", "tag2"],
  "featured": true,
  "bestLastWeek": false,
  "toolsIUse": false,
  "status": "checked"  // changing to checked auto-sets reviewedAt
}

// Response: updated Project object`}</CodeBlock>
        </Endpoint>

        <Endpoint method="DELETE" path="/api/admin/projects/:id" description="Delete a project">
          <CodeBlock>{`// Response
{ "ok": true }`}</CodeBlock>
        </Endpoint>
      </Section>

      {/* Queue Management */}
      <Section title="queue management">
        <Endpoint method="POST" path="/api/admin/projects/reorder" description="Reorder the queue">
          <CodeBlock>{`// Request body: array of project IDs in desired order
{
  "orderedIds": ["proj-5", "proj-2", "proj-8", "proj-1"]
}

// Response
{ "ok": true }`}</CodeBlock>
        </Endpoint>

        <Endpoint method="POST" path="/api/admin/projects/finish-review" description="Finish current review, promote next in queue">
          <CodeBlock>{`// No request body needed
// What happens:
// 1. Current in_review project → status: "checked"
// 2. First project in queue → status: "in_review"

// Response
{
  "finished": "proj-123",  // project that was moved to checked
  "promoted": "proj-456"   // project that was promoted to in_review
}`}</CodeBlock>
        </Endpoint>
      </Section>

      {/* Reviews */}
      <Section title="reviews">
        <Endpoint method="GET" path="/api/admin/reviews?projectId=:id" description="Get reviews for a project">
          <CodeBlock>{`// Response: Review[]
[{
  "id": "rev-123",
  "projectId": "proj-123",
  "reviewNumber": 1,
  "text": "## First Impression\\n...",
  "loomUrl": "https://loom.com/embed/...",
  "published": true,
  "createdAt": "2026-03-08T...",
  "updatedAt": "2026-03-08T..."
}]`}</CodeBlock>
        </Endpoint>

        <Endpoint method="POST" path="/api/admin/reviews" description="Create a new review">
          <CodeBlock>{`// Request body
{
  "projectId": "proj-123",
  "text": "## First Impression\\nGreat project...",
  "loomUrl": "https://loom.com/embed/...",  // optional
  "published": false
}

// Response
{ "id": "rev-456" }`}</CodeBlock>
        </Endpoint>

        <Endpoint method="PATCH" path="/api/admin/reviews/:id" description="Update a review">
          <CodeBlock>{`// Request body (only send fields to update)
{
  "text": "updated review text...",
  "loomUrl": "https://...",
  "published": true
}

// Response: updated Review object`}</CodeBlock>
        </Endpoint>

        <Endpoint method="DELETE" path="/api/admin/reviews/:id" description="Delete a review">
          <CodeBlock>{`// Response
{ "ok": true }`}</CodeBlock>
        </Endpoint>
      </Section>

      {/* Claude usage example */}
      <Section title="example: add projects via script">
        <div className="rounded-lg border border-border bg-surface/50 p-4">
          <p className="text-xs font-mono text-muted mb-3">
            use this with claude or any http client to batch-add projects:
          </p>
          <CodeBlock>{`# 1. Login first to get the cookie
curl -X POST http://localhost:3000/api/admin/login \\
  -H "Content-Type: application/json" \\
  -d '{"password":"your_password"}' \\
  -c cookies.txt

# 2. Add a project
curl -X POST http://localhost:3000/api/admin/projects \\
  -H "Content-Type: application/json" \\
  -b cookies.txt \\
  -d '{
    "name": "CoolApp",
    "url": "https://coolapp.dev",
    "xHandle": "coolapp_dev"
  }'

# 3. Reorder queue
curl -X POST http://localhost:3000/api/admin/projects/reorder \\
  -H "Content-Type: application/json" \\
  -b cookies.txt \\
  -d '{"orderedIds": ["proj-new", "proj-old"]}'`}</CodeBlock>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-sm font-mono text-muted uppercase tracking-wider mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Endpoint({
  method,
  path,
  description,
  children,
}: {
  method: string;
  path: string;
  description: string;
  children: React.ReactNode;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-500",
    POST: "bg-green/10 text-green",
    PATCH: "bg-yellow-500/10 text-yellow-600",
    DELETE: "bg-red-500/10 text-red-500",
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 bg-surface/30 flex items-center gap-3">
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${methodColors[method] || ""}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-foreground">{path}</code>
        <span className="text-xs text-muted ml-auto">{description}</span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="text-xs font-mono text-foreground/80 bg-surface/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
      {children}
    </pre>
  );
}
