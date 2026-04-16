import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import { Interval } from "date-fns";

/**
 * A wrapper component to bridge the Power BI visual and the React component.
 * It passes all props directly to the main visual component.
 */
interface ReactContainerProps {
  component: React.ComponentType<any>;
  data: any;
  onFilterChanged?: (data: Interval) => void;
}

const ReactContainer: React.FC<ReactContainerProps> = ({
  component: Component,
  data,
  onFilterChanged,
}) => {
  // Ensure handler is instance-scoped and stable
  const handleFilterChanged = React.useCallback(
    (interval: Interval) => {
      onFilterChanged?.(interval);
    },
    [onFilterChanged],
  );

  return <Component {...data} onFilterChanged={handleFilterChanged} />;
};

/**
 * An abstract class to provide common functionality for Power BI visuals
 * that use React.
 */
export abstract class ReactVisual {
  protected reactTarget: HTMLElement;
  protected root: Root | null = null;
  private mainComponent!: React.ComponentType<any>;
  private filterCallback!: (data: Interval) => void;

  constructor(options: VisualConstructorOptions) {
    this.reactTarget = options.element;
  }

  /**
   * Initializes the React component tree by creating the root and
   * performing the initial render.
   * @param component The main React component to render.
   * @param onFilterChanged The callback function for filter changes.
   */
  protected initializeReact(
    component: React.ComponentType<any>,
    onFilterChanged: (data: Interval) => void,
  ): void {
    if (!this.root) {
      this.root = createRoot(this.reactTarget);
    }
    this.mainComponent = component;
    this.filterCallback = onFilterChanged;
    this.updateReactContainers({});
  }

  /**
   * Updates the component with new data. This method is called
   * in the visual's `update` method.
   * @param data The props to pass to the main component.
   */
  // in your visual class
  protected updateReactContainers = (data: any): void => {
    if (this.root && this.mainComponent) {
      // 👇 ensure "data" is stable unless something truly changed
      const stableData = JSON.parse(JSON.stringify(data));

      this.root.render(
        React.createElement(ReactContainer, {
          component: this.mainComponent,
          data: stableData,
          onFilterChanged: this.filterCallback,
        }),
      );
    }
  };

  /**
   * Unmounts the component tree, used when the visual is destroyed.
   */
  protected reactUnmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
