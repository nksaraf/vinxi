import { Link } from "react-router-dom";
export default ({ href, ...props }) => {
	return <Link to={href} {...props} />;
};
