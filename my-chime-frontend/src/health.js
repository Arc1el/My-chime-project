import { Route } from "react-router-dom";

const Routes = () => {
    return (
            <Route path="/health">
                <script>
                    console.log("App is Healthy");
                </script>
                <h3>Hey There!!! The App is Healthy</h3>
            </Route>
    );
};

export default Routes;