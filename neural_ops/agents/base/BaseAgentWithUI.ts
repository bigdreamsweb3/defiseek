// Base Agent with UI Component Support
// This provides a standardized way for all agents to include UI components

export interface UIComponent {
  component: string;
  props: {
    result: any;
    toolCallId: string;
    args: any;
  };
}

export interface AgentResponse {
  // Standard response fields
  query?: string;
  analysis?: string;
  timestamp: string;
  confidence?: number;
  modelUsed?: string;
  dataSources?: string[];
  suggestions?: string[];
  
  // UI Components support
  uiComponents?: {
    [key: string]: UIComponent | { [key: string]: UIComponent };
  };
  
  // Error handling
  error?: string;
  details?: string;
  
  // Additional data
  [key: string]: any;
}

export abstract class BaseAgentWithUI {
  protected abstract agentName: string;
  
  // Helper method to create UI component data
  protected createUIComponent(
    componentName: string,
    data: any,
    toolCallId: string,
    args: any
  ): UIComponent {
    return {
      component: componentName,
      props: {
        result: {
          success: true,
          data: data
        },
        toolCallId,
        args
      }
    };
  }
  
  // Helper method to create error UI component
  protected createErrorUIComponent(
    componentName: string,
    error: string,
    details?: string,
    toolCallId?: string,
    args?: any
  ): UIComponent {
    return {
      component: componentName,
      props: {
        result: {
          success: false,
          data: {
            error,
            details,
            retry: true
          }
        },
        toolCallId: toolCallId || `${componentName}-error`,
        args: args || {}
      }
    };
  }
  
  // Helper method to add UI components to response
  protected addUIComponentsToResponse(
    response: AgentResponse,
    uiComponents: { [key: string]: UIComponent | { [key: string]: UIComponent } }
  ): AgentResponse {
    return {
      ...response,
      uiComponents: {
        ...response.uiComponents,
        ...uiComponents
      }
    };
  }
  
  // Abstract method that agents must implement
  abstract execute(query: string): Promise<AgentResponse>;
}
