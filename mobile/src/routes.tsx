import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Home from "./pages/Home";
import ColletionPoints from "./pages/CollectionPoints";
import ColletionPointsDetails from "./pages/CollectionPointsDetails";

const AppStack = createStackNavigator();

const Routes = () => {
  return (
    <NavigationContainer>
      <AppStack.Navigator
        headerMode="none"
        screenOptions={{
          cardStyle: {
            backgroundColor: "#f0f0f0",
          },
        }}
      >
        <AppStack.Screen name="Home" component={Home} />
        <AppStack.Screen name="ColletionPoints" component={ColletionPoints} />
        <AppStack.Screen
          name="ColletionPointsDetails"
          component={ColletionPointsDetails}
        />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
