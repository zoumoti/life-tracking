import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { FlexWidget, TextWidget } from "react-native-android-widget";

// Minimal test widget to confirm rendering works
function TestWidget({ name }: { name: string }) {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="🎯 Life OS"
        style={{ fontSize: 18, color: "#D4AA40" }}
      />
      <TextWidget
        text={name}
        style={{ fontSize: 12, color: "#6b6560", marginTop: 8 }}
      />
    </FlexWidget>
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetName = props.widgetInfo.widgetName;

  switch (widgetName) {
    case "LifeOSSmall":
      return <TestWidget name="Small" />;
    case "LifeOSMedium":
      return <TestWidget name="Medium" />;
    case "LifeOSLarge":
      return <TestWidget name="Large" />;
    default:
      return <TestWidget name="Widget" />;
  }
}
