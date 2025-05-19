import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

interface ContainerProps {
  component: React.ComponentType<any>;
  data: Partial<VisualUpdateOptions>;
  onFilterChanged?: (data: any) => void;
}

const ReactContainer: React.FC<ContainerProps> = ({ component: Component, data, onFilterChanged, ...rest }) => (
  <Component {...data} {...rest} onFilterChanged={onFilterChanged} />
);

export default ReactContainer;

export abstract class ReactVisual {
  protected reactTarget: HTMLElement;
  protected reactRenderer: React.ComponentType<any>;
  protected root: Root | null = null;

  constructor(options: VisualConstructorOptions) {
    this.reactTarget = options.element;
  }

  protected reactMount(): void {
    if (!this.root) {
      this.root = createRoot(this.reactTarget);
    }
    this.root.render(React.createElement(this.reactRenderer));
  }

  protected updateReactContainers = (data: any): void => {
    if (this.root) {
      this.root.render(React.createElement(this.reactRenderer, { data }));
    }
  };

  protected createReactContainer = (component: React.ComponentType<any>, onFilterChanged: (dates: any) => void) => (
    props: any
  ) => React.createElement(ReactContainer, { component, ...props, onFilterChanged });

  protected reactUnmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
