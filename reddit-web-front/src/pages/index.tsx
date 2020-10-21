import NavBar from "../components/navBar";
import { withUrqlClient } from "next-urql";
import { urqlClient } from "../utils/createUrqlProvider";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <NavBar />
      <div>hello world</div>
      <br />
      {!data ? (
        <div>
          <h3>loading</h3>
        </div>
      ) : (
        data.allPost?.map((post) => {
          return <p key={post.id}>{post.title}</p>;
        })
      )}
    </>
  );
};

export default withUrqlClient(urqlClient, { ssr: true })(Index);
