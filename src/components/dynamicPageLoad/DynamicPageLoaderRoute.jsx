import { useParams } from 'react-router-dom';
import DynamicPageLoader from './DynamicPageLoader';

export default function DynamicRoute() {
  const { pageName } = useParams();
  return <DynamicPageLoader pageName={pageName} />;
}