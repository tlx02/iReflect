import { useParams } from "react-router-dom";

export default function useGetUidAndToken() {
  const { uid, token } = useParams();
  return { uid, token };
}
