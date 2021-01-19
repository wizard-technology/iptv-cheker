import axios from "axios";
import { useState } from "react";
import TableNew from "./TableNew";
import { Layout, Row, Col, Card, Input, Collapse } from "antd";
import { v4 as uuidv4 } from "uuid";
import dateFormat from "dateformat";

const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { Panel } = Collapse;

function App() {
  const [loading, setLoading] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [search, setSearch] = useState("");
  const [timeout, setTimeout] = useState(3);
  const [playlistinfo, setPlaylistinfo] = useState([]);

  const onClickHandling = (e) => {
    setLoading(true);
    axios
      .post(
        `http://localhost/api/get`,
        {
          url: `${e}`,
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
      .then((res) => {
        let data = [];
        let url = `${res.data["server_info"]["server_protocol"]}://${res.data["server_info"]["url"]}:${res.data["server_info"]["port"]}`;
        let username = `${res.data["user_info"]["username"]}`;
        let password = `${res.data["user_info"]["password"]}`;
        setPlaylistinfo([...playlistinfo, res.data["user_info"]]);

        Object.values(res.data["available_channels"]).forEach((ech) => {
          if (ech.stream_type === "live") {
            data.push({
              key: `${url}/${username}/${password}/${ech.stream_id}`,
              name: ech.name,
              host: `${res.data["server_info"]["url"]}:${res.data["server_info"]["port"]}`,
              category: ech.category_name,
              url: `${url}/${username}/${password}/${ech.stream_id}`,
              status: "Unknowen",
              loading: false,
              timeout: timeout,
            });
          } else if (ech.stream_type === "movie") {
            data.push({
              key: `${url}/movie/${username}/${password}/${ech.stream_id}.${ech.container_extension}`,
              name: ech.name,
              host: `${res.data["server_info"]["url"]}:${res.data["server_info"]["port"]}`,
              category: ech.category_name,
              url: `${url}/movie/${username}/${password}/${ech.stream_id}.${ech.container_extension}`,
              status: "Unknowen",
              loading: false,
              timeout: timeout,
            });
          } else if (ech.stream_type === "created_live") {
          }
        });
        setDataTable([...dataTable, ...data]);
        setLoading(false);
        setSearch("");
      })
      .catch((error) => {
        setLoading(false);

        console.error(error);
      });
  };
  return (
    <div>
      <Layout className="layout">
        <Header>
          <div className="logo" />
        </Header>
        <Content
          style={{
            padding: "0 50px",
            minHeight: "calc(100vh - 190px)",
          }}
        >
          <Content
            className="site-layout"
            style={{ padding: "0 50px", marginTop: 64 }}
          >
            <Row justify="space-between">
              <Col span={12}>
                <Card title="Add URL">
                  <div style={{ height: "20px" }}></div>

                  <Input
                    placeholder="Timeout"
                    size="large"
                    value={timeout}
                    onChange={(e) => setTimeout(e.target.value)}
                  />
                  <div style={{ height: "20px" }}></div>

                  <Search
                    value={search}
                    placeholder="Input M3U URL"
                    enterButton="Search"
                    onChange={(e) => setSearch(e.target.value)}
                    size="large"
                    onSearch={onClickHandling}
                    loading={loading}
                  />
                </Card>
              </Col>
              <Col span={11}>
                <Card title="Playlists">
                  <Collapse defaultActiveKey={["1"]}>
                    {playlistinfo.map((el) => (
                      <Panel header={`${el.username}`} key={uuidv4()}>
                        <p>{`Username : ${el.username}`}</p>
                        <p>{`Password : ${el.password}`}</p>
                        <p
                          style={{
                            color:
                              el.active_cons > el.max_connections
                                ? "volcano"
                                : "#69c0ff",
                          }}
                        >{`Connection : ${el.active_cons} / ${el.max_connections}`}</p>
                        <p>{`Status : ${el.status}`}</p>
                        <p>{`Created At : ${dateFormat(
                          new Date(el.created_at * 1000).toDateString(),
                          "mmmm dS, yyyy"
                        )}`}</p>
                        <p>{`Expire At : ${dateFormat(
                          new Date(el.exp_date * 1000).toDateString(),
                          "mmmm dS, yyyy"
                        )}`}</p>
                      </Panel>
                    ))}
                  </Collapse>
                </Card>
              </Col>
              <Col span={24}>
                <div style={{ height: "20px" }}></div>
              </Col>

              <Col span={24}>
                <Card title="List Channels">
                  <TableNew datas={dataTable} />
                </Card>
              </Col>
            </Row>
          </Content>
        </Content>
        <div style={{ height: "100px" }}></div>

        <Footer
          style={{
            textAlign: "center",
            position: "fixed",
            left: "0",
            bottom: "0",
            width: "100%",
          }}
        >
          ©{new Date().getFullYear()} Created by WT
        </Footer>
      </Layout>
    </div>
  );
}

export default App;
