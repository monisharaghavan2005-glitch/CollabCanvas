import {
  ArrowRight,
  Check,
  Layers3,
  MousePointer2,
  Play,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Landing.css";

function CanvasPreview() {
  return (
    <div className="canvas-preview">
      <div className="preview-topbar">
        <div className="preview-brand">
          <div className="preview-logo">C</div>
          <span>Product Strategy</span>
        </div>

        <div className="preview-users">
          <span className="avatar avatar-purple">M</span>
          <span className="avatar avatar-blue">A</span>
          <span className="avatar avatar-green">N</span>
          <button>Share</button>
        </div>
      </div>

      <div className="preview-body">
        <div className="preview-toolbar">
          <div className="tool active">↖</div>
          <div className="tool">□</div>
          <div className="tool">T</div>
          <div className="tool">✎</div>
          <div className="tool">→</div>
        </div>

        <div className="sticky-card">
          <span>💡</span>
          <strong>Big idea</strong>
          <p>Build together, faster.</p>
        </div>

        <div className="preview-card card-one">
          <small>PROJECT</small>
          <h3>CollabCanvas</h3>
          <p>Real-time collaboration platform</p>
        </div>

        <div className="preview-card card-two">
          <div className="mini-line" />
          <div className="mini-line short" />
          <div className="mini-line" />
          <div className="mini-line shorter" />
        </div>

        <div className="connection-line" />

        <div className="cursor cursor-one">
          <MousePointer2 size={18} fill="currentColor" />
          <span>Monisha</span>
        </div>

        <div className="cursor cursor-two">
          <MousePointer2 size={18} fill="currentColor" />
          <span>Alex</span>
        </div>

        <div className="selection-box" />
      </div>

      <div className="preview-status">
        <span className="live-dot" />
        All changes saved
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <Icon size={21} />
      </div>

      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Landing() {
  return (
    <main className="landing">
      <nav className="navbar">
        <Link to="/" className="brand">
          <div className="brand-mark">C</div>
          <span>Collab<span>Canvas</span></span>
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">How it works</a>
          <a href="#security">Security</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="sign-in">
            Sign in
          </Link>

          <Link to="/register" className="nav-button">
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero container">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={15} />
            <span>Real-time collaboration, reimagined</span>
          </div>

          <h1>
            Create together.
            <br />
            <span className="gradient-text">Without limits.</span>
          </h1>

          <p>
            CollabCanvas brings your team together in one intelligent
            collaborative workspace. Design, brainstorm and build in real time.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary hero-button">
              Start Collaborating
              <ArrowRight size={18} />
            </Link>

            <a href="#preview" className="btn btn-secondary hero-button">
              <Play size={17} />
              Explore Demo
            </a>
          </div>

          <div className="hero-trust">
            <div className="trust-avatars">
              <span>A</span>
              <span>M</span>
              <span>R</span>
              <span>+</span>
            </div>

            <div>
              <strong>Built for teams</strong>
              <p>Work together from anywhere</p>
            </div>
          </div>
        </div>

        <div className="hero-visual" id="preview">
          <div className="glow glow-one" />
          <div className="glow glow-two" />
          <CanvasPreview />
        </div>
      </section>

      <section className="stats container">
        <div>
          <strong>∞</strong>
          <span>Ideas captured</span>
        </div>

        <div>
          <strong>24/7</strong>
          <span>Team collaboration</span>
        </div>

        <div>
          <strong>1</strong>
          <span>Unified workspace</span>
        </div>

        <div>
          <strong>0</strong>
          <span>Context switching</span>
        </div>
      </section>

      <section className="features-section container" id="features">
        <div className="section-label">POWERFUL BY DESIGN</div>

        <h2>
          Everything your team needs
          <br />
          <span>to create together.</span>
        </h2>

        <p className="section-description">
          One connected workspace for ideas, planning, design and execution.
        </p>

        <div className="features-grid">
          <Feature
            icon={Users}
            title="Real-time collaboration"
            text="See your teammates' cursors, edits and presence instantly as everyone works together."
          />

          <Feature
            icon={Layers3}
            title="Infinite canvas"
            text="Move freely between ideas with a flexible canvas designed for brainstorming and visual thinking."
          />

          <Feature
            icon={Zap}
            title="Instant synchronization"
            text="Changes are synchronized across connected clients so everyone stays on the same page."
          />

          <Feature
            icon={Sparkles}
            title="Smart workspace"
            text="Organize documents, projects and collaborative sessions inside structured workspaces."
          />
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="container workflow">
          <div>
            <div className="section-label">SIMPLE WORKFLOW</div>

            <h2>
              From idea
              <br />
              <span>to execution.</span>
            </h2>

            <p>
              CollabCanvas removes the friction between thinking and doing.
              Bring your team into the same space and keep momentum moving.
            </p>
          </div>

          <div className="workflow-list">
            <div className="workflow-item">
              <span>01</span>
              <div>
                <h3>Create a workspace</h3>
                <p>Set up a shared environment for your project.</p>
              </div>
            </div>

            <div className="workflow-item">
              <span>02</span>
              <div>
                <h3>Invite your team</h3>
                <p>Bring teammates together with role-based access.</p>
              </div>
            </div>

            <div className="workflow-item">
              <span>03</span>
              <div>
                <h3>Build together</h3>
                <p>Edit, brainstorm and collaborate in real time.</p>
              </div>
            </div>

            <div className="workflow-item">
              <span>04</span>
              <div>
                <h3>Ship with confidence</h3>
                <p>Keep your work organized, saved and accessible.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="security-section container" id="security">
        <div className="security-card">
          <div>
            <div className="section-label">BUILT WITH SECURITY IN MIND</div>

            <h2>Your workspace stays yours.</h2>

            <p>
              Secure authentication, workspace permissions and protected
              collaboration keep your team's work under control.
            </p>
          </div>

          <div className="security-points">
            <div>
              <Check size={17} />
              JWT authentication
            </div>

            <div>
              <Check size={17} />
              Role-based access
            </div>

            <div>
              <Check size={17} />
              Protected workspaces
            </div>

            <div>
              <Check size={17} />
              Secure API architecture
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section container">
        <div className="cta-card">
          <Sparkles size={25} />
          <h2>Ready to create together?</h2>
          <p>Start building your collaborative workspace today.</p>

          <Link to="/register" className="btn btn-primary">
            Get Started
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <Link to="/" className="brand">
            <div className="brand-mark">C</div>
            <span>Collab<span>Canvas</span></span>
          </Link>

          <p>Collaborate. Create. Ship.</p>

          <span>© 2026 CollabCanvas</span>
        </div>
      </footer>
    </main>
  );
}

export default Landing;