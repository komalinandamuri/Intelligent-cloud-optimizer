
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Cloud,
  Database,
  LayoutDashboard,
  RefreshCw,
  Server,
  ShieldCheck,
  CircleHelp,
} from "lucide-react";
import "./App.css";

const API_URL = "https://5xbj1zmsj7.execute-api.ap-south-1.amazonaws.com/resources";

function App() {
  const [resources, setResources] = useState({ ec2: [], s3: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activePage, setActivePage] = useState("Overview");

  const loadResources = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();

      setResources({
        ec2: Array.isArray(data.ec2) ? data.ec2 : [],
        s3: Array.isArray(data.s3) ? data.s3 : [],
      });

      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Unable to load AWS resources.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const runningCount = resources.ec2.filter(
    (instance) => instance.state === "running"
  ).length;

  const navItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "EC2 Instances", icon: Server },
    { label: "S3 Buckets", icon: Database },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Cloud size={24} />
          </div>
          <div>
            <h2>CloudPilot</h2>
            <span>CLOUD MANAGEMENT</span>
          </div>
        </div>

        <div className="nav-heading">WORKSPACE</div>

        <nav className="navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => setActivePage(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <strong>Read-only discovery</strong>
            <p>Inspect your AWS inventory</p>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {activePage}
          </div>
          <div className="connection">
            <span className={`connection-dot ${error ? "offline" : ""}`} />
            {error ? "Connection issue" : "AWS resource monitor"}
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">CLOUD RESOURCE MANAGEMENT</div>
              <h1>{activePage}</h1>
              <p className="subtitle">
                Monitor your AWS infrastructure from one place.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={() => loadResources(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={refreshing ? "spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh data"}
            </button>
          </div>

          {error && (
            <div className="error-banner">
              <CircleHelp size={19} />
              <div>
                <strong>Could not load AWS resources</strong>
                <p>{error}. Check your API URL and connection.</p>
              </div>
              <button onClick={() => loadResources(true)}>Retry</button>
            </div>
          )}

          {activePage === "Overview" && (
            <>
              <div className="section-heading">
                <h2>Resource overview</h2>
                <span>Region: Asia Pacific (Mumbai)</span>
              </div>

              <section className="stats-grid">
                <article className="stat-card">
                  <div className="stat-top">
                    <span>EC2 Instances</span>
                    <div className="stat-icon blue">
                      <Server size={21} />
                    </div>
                  </div>
                  <div className="stat-number">
                    {loading ? "—" : resources.ec2.length}
                  </div>
                  <p>Compute resources discovered</p>
                  <div className="stat-footer">AWS inventory</div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span>S3 Buckets</span>
                    <div className="stat-icon green">
                      <Database size={21} />
                    </div>
                  </div>
                  <div className="stat-number">
                    {loading ? "—" : resources.s3.length}
                  </div>
                  <p>Storage buckets discovered</p>
                  <div className="stat-footer">AWS inventory</div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span>Running Instances</span>
                    <div className="stat-icon purple">
                      <Activity size={21} />
                    </div>
                  </div>
                  <div className="stat-number">
                    {loading ? "—" : runningCount}
                  </div>
                  <p>Instances currently running</p>
                  <div className="stat-footer">Based on EC2 state</div>
                </article>
              </section>

              <section className="inventory-card">
                <div className="inventory-header">
                  <div>
                    <h2>EC2 instance inventory</h2>
                    <p>Instances returned by your AWS account</p>
                  </div>
                  <span className="count-label">
                    {resources.ec2.length} total
                  </span>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>INSTANCE ID</th>
                        <th>INSTANCE TYPE</th>
                        <th>STATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && resources.ec2.map((instance) => (
                        <tr key={instance.id}>
                          <td className="resource-id">{instance.id}</td>
                          <td>{instance.type || "—"}</td>
                          <td>
                            <span className={`status-pill ${
                              instance.state === "running"
                                ? "status-running"
                                : "status-neutral"
                            }`}>
                              <span className="status-dot" />
                              {instance.state || "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!loading && resources.ec2.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon"><Server size={25} /></div>
                      <h3>No EC2 instances found</h3>
                      <p>
                        Your account returned no EC2 instances.
                        No resources need to be created for this demo.
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="table-message">Loading AWS inventory...</div>
                  )}
                </div>
              </section>

              <section className="inventory-card">
                <div className="inventory-header">
                  <div>
                    <h2>S3 bucket inventory</h2>
                    <p>Storage buckets returned by your AWS account</p>
                  </div>
                  <span className="count-label">
                    {resources.s3.length} total
                  </span>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>BUCKET NAME</th>
                        <th>CREATED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && resources.s3.map((bucket) => (
                        <tr key={bucket.name}>
                          <td className="resource-id">{bucket.name}</td>
                          <td>
                            {bucket.created
                              ? new Date(bucket.created).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!loading && resources.s3.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon"><Database size={25} /></div>
                      <h3>No S3 buckets found</h3>
                      <p>
                        Your account returned no S3 buckets.
                        This is a valid empty inventory.
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="table-message">Loading AWS inventory...</div>
                  )}
                </div>
              </section>
            </>
          )}

          {activePage === "EC2 Instances" && (
            <section className="inventory-card standalone-card">
              <div className="inventory-header">
                <div>
                  <h2>All EC2 instances</h2>
                  <p>Live data from your connected AWS API</p>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>INSTANCE ID</th>
                      <th>TYPE</th>
                      <th>STATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.ec2.map((instance) => (
                      <tr key={instance.id}>
                        <td className="resource-id">{instance.id}</td>
                        <td>{instance.type || "—"}</td>
                        <td>{instance.state || "Unknown"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && resources.ec2.length === 0 && (
                  <div className="empty-state">
                    <Server size={28} />
                    <h3>No EC2 instances found</h3>
                    <p>Your AWS inventory is empty.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activePage === "S3 Buckets" && (
            <section className="inventory-card standalone-card">
              <div className="inventory-header">
                <div>
                  <h2>All S3 buckets</h2>
                  <p>Live data from your connected AWS API</p>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>BUCKET NAME</th>
                      <th>CREATED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.s3.map((bucket) => (
                      <tr key={bucket.name}>
                        <td className="resource-id">{bucket.name}</td>
                        <td>
                          {bucket.created
                            ? new Date(bucket.created).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && resources.s3.length === 0 && (
                  <div className="empty-state">
                    <Database size={28} />
                    <h3>No S3 buckets found</h3>
                    <p>Your AWS inventory is empty.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <footer className="page-footer">
            <span>CloudPilot</span>
            <span>Intelligent Cloud Resource Optimizer</span>
            <span>
              {lastUpdated
                ? `Last updated ${lastUpdated.toLocaleTimeString()}`
                : "Waiting for data"}
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
