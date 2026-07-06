import type { CanvasElement, Connector } from '@/types/canvas.types';
import type { Template } from '@/stores/template.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { useFileStore } from '@/stores/file.store';
import { useTemplateStore } from '@/stores/template.store';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { CommandManager } from '@/editor/CommandManager';

// Helpers to build layout elements
let idCounter = 0;
const nextId = (prefix: string) => `${prefix}_tmpl_${Date.now()}_${++idCounter}`;

function createTmplElement(
  type: string,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  extraStyle: any = {}
): CanvasElement {
  return {
    id: nextId(type),
    type,
    bounds: { x, y, width: w, height: h },
    label,
    style: {
      fillColor: 'var(--color-element-fill, #ffffff)',
      strokeColor: 'var(--color-element-stroke, #4f46e5)',
      strokeWidth: 2,
      opacity: 1,
      borderRadius: 6,
      fontSize: 13,
      fontFamily: 'Inter',
      fontColor: 'var(--color-element-text, #1e1b4b)',
      textAlign: 'center',
      ...extraStyle,
    },
    rotation: 0,
    locked: false,
    visible: true,
    zIndex: idCounter,
  };
}

function createTmplConnector(
  type: 'straight' | 'orthogonal' | 'curved',
  sourceId: string,
  targetId: string,
  sourceAnchor: string,
  targetAnchor: string,
  label: string = '',
  extraStyle: any = {}
): Connector {
  return {
    id: nextId('conn'),
    type,
    sourceId,
    targetId,
    sourcePoint: { x: 0, y: 0 },
    targetPoint: { x: 0, y: 0 },
    sourceAnchorId: sourceAnchor as any,
    targetAnchorId: targetAnchor as any,
    waypoints: [],
    label,
    style: {
      strokeColor: 'var(--color-connector-stroke, #4f46e5)',
      strokeWidth: 2,
      startArrow: false,
      endArrow: true,
      ...extraStyle,
    },
    zIndex: idCounter,
  };
}

export const builtInTemplates: Template[] = [];

// 1. Flowchart Template
const buildFlowchart = (): Template => {
  const start = createTmplElement('fc_terminal', 300, 100, 130, 60, 'Start Process', { fillColor: 'rgba(99,102,241,0.1)' });
  const process1 = createTmplElement('fc_process', 300, 220, 130, 80, 'Enter Credentials');
  const decision = createTmplElement('fc_decision', 305, 360, 120, 80, 'Validated?');
  const process2 = createTmplElement('fc_process', 510, 360, 130, 80, 'Show Error Msg');
  const end = createTmplElement('fc_terminal', 300, 500, 130, 60, 'End Success', { fillColor: 'rgba(34,197,94,0.1)', strokeColor: '#22c55e' });

  const connectors = [
    createTmplConnector('orthogonal', start.id, process1.id, 'B', 'T'),
    createTmplConnector('orthogonal', process1.id, decision.id, 'B', 'T'),
    createTmplConnector('orthogonal', decision.id, end.id, 'B', 'T', 'Yes'),
    createTmplConnector('orthogonal', decision.id, process2.id, 'R', 'L', 'No'),
    createTmplConnector('orthogonal', process2.id, process1.id, 'T', 'R'),
  ];

  return {
    id: 'built_in_flowchart',
    title: 'Authentication Process Flow',
    description: 'A standard user login flowchart with credentials verification and error loops.',
    category: 'Flowcharts',
    tags: ['Flow', 'Process', 'User Login'],
    difficulty: 'Beginner',
    elements: [start, process1, decision, process2, end],
    connectors,
  };
};

// 2. UML Class Diagram Template
const buildUML = (): Template => {
  const userClass = createTmplElement('uml_class', 150, 100, 160, 140, 'User', { fillColor: 'rgba(99,102,241,0.05)' });
  const adminClass = createTmplElement('uml_class', 150, 320, 160, 140, 'AdminUser', { fillColor: 'rgba(99,102,241,0.05)' });
  const authIface = createTmplElement('uml_interface', 420, 100, 160, 140, 'Authenticatable', { fillColor: 'rgba(168,85,247,0.05)', strokeColor: '#a855f7' });

  const connectors = [
    createTmplConnector('orthogonal', adminClass.id, userClass.id, 'T', 'B', 'extends', { strokeDasharray: undefined }),
    createTmplConnector('orthogonal', userClass.id, authIface.id, 'R', 'L', 'implements', { strokeDasharray: '5 5' }),
  ];

  return {
    id: 'built_in_uml',
    title: 'User Management Classes',
    description: 'UML structure illustrating object-oriented inheritance and interface implementation.',
    category: 'UML',
    tags: ['Class Diagram', 'OOD', 'Architecture'],
    difficulty: 'Intermediate',
    elements: [userClass, adminClass, authIface],
    connectors,
  };
};

// 3. Entity Relationship Diagram (ERD) Template
const buildERD = (): Template => {
  const customers = createTmplElement('er_entity_cols', 100, 150, 180, 130, 'Customers', { fillColor: 'rgba(14,165,233,0.05)', strokeColor: '#0ea5e9' });
  const orders = createTmplElement('er_entity_cols', 400, 150, 180, 130, 'Orders', { fillColor: 'rgba(14,165,233,0.05)', strokeColor: '#0ea5e9' });

  const connectors = [
    createTmplConnector('orthogonal', customers.id, orders.id, 'R', 'L', 'places', { strokeColor: '#0ea5e9' }),
  ];

  return {
    id: 'built_in_erd',
    title: 'Customer Orders Relational Schema',
    description: 'Relational database schema displaying tables, primary/foreign keys, and relational cardinality.',
    category: 'Entity Relationship Diagrams',
    tags: ['Database', 'ERD', 'SQL'],
    difficulty: 'Intermediate',
    elements: [customers, orders],
    connectors,
  };
};

// 4. AWS Architecture Template
const buildAWS = (): Template => {
  const region = createTmplElement('rectangle', 80, 80, 560, 360, 'AWS Region (us-east-1)', {
    fillColor: 'transparent',
    strokeColor: '#f97316',
    strokeWidth: 2,
    strokeDasharray: '6 4',
    textAlign: 'left',
    fontColor: '#ea580c',
  });
  const vpc = createTmplElement('rectangle', 120, 140, 480, 270, 'VPC (10.0.0.0/16)', {
    fillColor: 'transparent',
    strokeColor: '#22c55e',
    strokeWidth: 2,
    strokeDasharray: '4 4',
    textAlign: 'left',
    fontColor: '#16a34a',
  });
  const ec2 = createTmplElement('rounded_rect', 160, 220, 120, 80, 'EC2 AppInstance\n(Web Server)', { fillColor: 'rgba(249,115,22,0.08)', strokeColor: '#f97316' });
  const rds = createTmplElement('fc_database', 330, 200, 90, 110, 'RDS MySQL\n(Primary)', { fillColor: 'rgba(59,130,246,0.08)', strokeColor: '#3b82f6' });
  const s3 = createTmplElement('rounded_rect', 460, 220, 110, 80, 'S3 Assets\n(Static Files)', { fillColor: 'rgba(236,72,153,0.08)', strokeColor: '#ec4899' });

  const connectors = [
    createTmplConnector('orthogonal', ec2.id, rds.id, 'R', 'L', 'writes'),
    createTmplConnector('orthogonal', ec2.id, s3.id, 'T', 'T', 'uploads'),
  ];

  return {
    id: 'built_in_aws',
    title: 'Simple VPC Web App Infrastructure',
    description: 'Cloud architecture template mapping an EC2 server instance connected to RDS and S3.',
    category: 'AWS Architecture',
    tags: ['Cloud', 'AWS', 'Network', 'Infrastructure'],
    difficulty: 'Advanced',
    elements: [region, vpc, ec2, rds, s3],
    connectors,
  };
};

// 5. Network Diagram Template
const buildNetwork = (): Template => {
  const internet = createTmplElement('fc_cloud', 100, 180, 140, 90, 'Internet', { fillColor: 'rgba(14,165,233,0.08)', strokeColor: '#0ea5e9' });
  const firewall = createTmplElement('rectangle', 300, 185, 120, 80, 'Firewall Router', { fillColor: 'rgba(239,68,68,0.08)', strokeColor: '#ef4444' });
  const switchNode = createTmplElement('rectangle', 480, 185, 120, 80, 'LAN Switch', { fillColor: 'rgba(16,185,129,0.08)', strokeColor: '#10b981' });
  const workstation1 = createTmplElement('rounded_rect', 660, 120, 120, 80, 'Workstation 1', { fillColor: 'rgba(75,85,99,0.05)', strokeColor: '#4b5563' });
  const fileserver = createTmplElement('fc_database', 670, 240, 90, 110, 'File Server', { fillColor: 'rgba(75,85,99,0.05)', strokeColor: '#4b5563' });

  const connectors = [
    createTmplConnector('straight', internet.id, firewall.id, 'R', 'L'),
    createTmplConnector('straight', firewall.id, switchNode.id, 'R', 'L'),
    createTmplConnector('orthogonal', switchNode.id, workstation1.id, 'R', 'L'),
    createTmplConnector('orthogonal', switchNode.id, fileserver.id, 'R', 'L'),
  ];

  return {
    id: 'built_in_network',
    title: 'Office Local Area Network (LAN)',
    description: 'Corporate network layout tracking internet entry, firewall gateways, and local workgroups.',
    category: 'Network Diagrams',
    tags: ['LAN', 'Switch', 'Hardware'],
    difficulty: 'Intermediate',
    elements: [internet, firewall, switchNode, workstation1, fileserver],
    connectors,
  };
};

// 6. Org Chart Template
const buildOrgChart = (): Template => {
  const ceo = createTmplElement('rectangle', 350, 80, 140, 70, 'Alice Carter\nCEO', { fillColor: 'rgba(79,70,229,0.1)', strokeColor: '#4f46e5', fontSize: 14 });
  const vpTech = createTmplElement('rectangle', 200, 200, 140, 70, 'Bob Vance\nVP Engineering', { fillColor: 'rgba(14,165,233,0.1)', strokeColor: '#0ea5e9' });
  const vpProduct = createTmplElement('rectangle', 500, 200, 140, 70, 'Charlie Green\nVP Product', { fillColor: 'rgba(168,85,247,0.1)', strokeColor: '#a855f7' });
  const lead1 = createTmplElement('rounded_rect', 100, 310, 130, 60, 'Dave Miller\nTech Lead', { fontSize: 11 });
  const lead2 = createTmplElement('rounded_rect', 280, 310, 130, 60, 'Eve Parker\nQA Lead', { fontSize: 11 });

  const connectors = [
    createTmplConnector('orthogonal', ceo.id, vpTech.id, 'B', 'T'),
    createTmplConnector('orthogonal', ceo.id, vpProduct.id, 'B', 'T'),
    createTmplConnector('orthogonal', vpTech.id, lead1.id, 'B', 'T'),
    createTmplConnector('orthogonal', vpTech.id, lead2.id, 'B', 'T'),
  ];

  return {
    id: 'built_in_org',
    title: 'Engineering Department Hierarchy',
    description: 'A classic tree layout detailing reporting structures from executive level to operational leads.',
    category: 'Org Charts',
    tags: ['Team', 'Management', 'HR'],
    difficulty: 'Beginner',
    elements: [ceo, vpTech, vpProduct, lead1, lead2],
    connectors,
  };
};

// 7. Mind Map Template
const buildMindMap = (): Template => {
  const center = createTmplElement('rounded_rect', 320, 200, 160, 80, 'New Product Launch', {
    fillColor: 'rgba(99,102,241,0.15)',
    strokeColor: '#4f46e5',
    strokeWidth: 3,
    fontSize: 15,
  });
  const design = createTmplElement('ellipse', 120, 100, 120, 70, 'Design & UX', { strokeColor: '#ec4899', fillColor: 'rgba(236,72,153,0.05)' });
  const marketing = createTmplElement('ellipse', 120, 310, 120, 70, 'Marketing', { strokeColor: '#f59e0b', fillColor: 'rgba(245,158,11,0.05)' });
  const engineering = createTmplElement('ellipse', 520, 100, 120, 70, 'Engineering', { strokeColor: '#10b981', fillColor: 'rgba(16,185,129,0.05)' });
  const support = createTmplElement('ellipse', 520, 310, 120, 70, 'Support', { strokeColor: '#0ea5e9', fillColor: 'rgba(14,165,233,0.05)' });

  const connectors = [
    createTmplConnector('curved', center.id, design.id, 'L', 'R', '', { strokeColor: '#ec4899' }),
    createTmplConnector('curved', center.id, marketing.id, 'L', 'R', '', { strokeColor: '#f59e0b' }),
    createTmplConnector('curved', center.id, engineering.id, 'R', 'L', '', { strokeColor: '#10b981' }),
    createTmplConnector('curved', center.id, support.id, 'R', 'L', '', { strokeColor: '#0ea5e9' }),
  ];

  return {
    id: 'built_in_mindmap',
    title: 'Product Brainstorming Map',
    description: 'A radially expanding mind map to organize design, launch, engineering, and support sub-goals.',
    category: 'Mind Maps',
    tags: ['Ideation', 'Brainstorm', 'Planning'],
    difficulty: 'Beginner',
    elements: [center, design, marketing, engineering, support],
    connectors,
  };
};

// 8. Process Workflow Template
const buildWorkflow = (): Template => {
  const lane1 = createTmplElement('rectangle', 80, 60, 600, 180, 'Front Office', {
    fillColor: 'transparent',
    strokeColor: 'var(--color-border)',
    textAlign: 'left',
    fontSize: 14,
    fontColor: 'rgba(79,70,229,0.5)',
  });
  const lane2 = createTmplElement('rectangle', 80, 240, 600, 180, 'Back Office', {
    fillColor: 'transparent',
    strokeColor: 'var(--color-border)',
    textAlign: 'left',
    fontSize: 14,
    fontColor: 'rgba(14,165,233,0.5)',
  });

  const request = createTmplElement('fc_terminal', 120, 120, 120, 60, 'Receive Request', { fillColor: 'rgba(79,70,229,0.08)' });
  const review = createTmplElement('fc_process', 290, 110, 130, 80, 'Review Details');
  const process = createTmplElement('fc_process', 290, 290, 130, 80, 'Execute Work');
  const end = createTmplElement('fc_terminal', 480, 290, 120, 60, 'Fulfill Order', { fillColor: 'rgba(34,197,94,0.08)', strokeColor: '#22c55e' });

  const connectors = [
    createTmplConnector('orthogonal', request.id, review.id, 'R', 'L'),
    createTmplConnector('orthogonal', review.id, process.id, 'B', 'T', 'Pass'),
    createTmplConnector('orthogonal', process.id, end.id, 'R', 'L'),
  ];

  return {
    id: 'built_in_workflow',
    title: 'Interdepartmental Order Workflow',
    description: 'Swimlane workflow showing cross-functional processing between Front Office and Back Office departments.',
    category: 'Process Workflows',
    tags: ['Swimlane', 'BPMN', 'Operations'],
    difficulty: 'Advanced',
    elements: [lane1, lane2, request, review, process, end],
    connectors,
  };
};

builtInTemplates.push(
  buildFlowchart(),
  buildUML(),
  buildERD(),
  buildAWS(),
  buildNetwork(),
  buildOrgChart(),
  buildMindMap(),
  buildWorkflow()
);

/**
 * Load a template into a new workspace tab.
 */
export function loadTemplate(template: Template): void {
  // 1. Open a new tab with template elements and connectors
  useWorkspaceStore.getState().openTab(null, template.title, template.elements, template.connectors);

  const { setViewport } = useCanvasStore.getState();

  // 2. Auto fit viewport bounds for the newly opened template tab
  if (template.elements.length > 0) {
    const xs = template.elements.map((e) => e.bounds.x);
    const ys = template.elements.map((e) => e.bounds.y);
    const maxXs = template.elements.map((e) => e.bounds.x + e.bounds.width);
    const maxYs = template.elements.map((e) => e.bounds.y + e.bounds.height);

    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...maxXs);
    const maxY = Math.max(...maxYs);

    const width = maxX - minX;
    const height = maxY - minY;

    const padding = 120;
    // Estimate layout canvas dimensions
    const viewportWidth = window.innerWidth - 320; 
    const viewportHeight = window.innerHeight - 120;

    const zoomX = viewportWidth / (width + padding * 2);
    const zoomY = viewportHeight / (height + padding * 2);
    const zoom = Math.max(0.2, Math.min(1.5, Math.min(zoomX, zoomY)));

    const panX = (viewportWidth - width * zoom) / 2 - minX * zoom;
    const panY = (viewportHeight - height * zoom) / 2 - minY * zoom;

    setViewport({ panX, panY, zoom });
  } else {
    setViewport({ panX: 0, panY: 0, zoom: 1 });
  }

  // Close welcome screen
  useTemplateStore.getState().setWelcomeScreenOpen(false);
}
