import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";
import logo from "../../assets/logo.svg";
import { FiArrowLeft } from "react-icons/fi";
import api from "../../services/api";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import { LeafletMouseEvent } from "leaflet";
import Dropzone from "../../components/Dropzone";

interface Material {
  readonly id: number;
  readonly title: string;
  readonly image_url: string;
}

interface Uf {
  readonly id: string;
  readonly sigla: string;
  readonly nome: string;
  readonly regiao: any;
}

interface City {
  readonly id: string;
  readonly nome: string;
}

const CreatePoint = () => {
  const [fileUrl, setFileUrl] = useState<File>();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);

  const [ufs, setUfs] = useState<Uf[]>([]);
  const [selectedUf, setselectedUf] = useState("0");

  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setselectedCity] = useState("0");

  const [selectedPosition, setselectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    api.get("materials").then(({ data }) => {
      setMaterials(data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<Uf[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then(({ data }) => {
        const states = data.map((uf) => uf);

        setUfs(states);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === "0") return;

    axios
      .get<City[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then(({ data }) => {
        const cities = data.map((city) => city);

        setCities(cities);
      });
  }, [selectedUf]);

  function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
    setselectedUf(event.target.value);
  }

  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
    setselectedCity(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setselectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  }

  function handleSelectMaterial(id: number) {
    const alreadySelected = selectedMaterials.findIndex(
      (material) => material === id
    );

    if (alreadySelected >= 0) {
      const fieltredItems = selectedMaterials.filter(
        (material) => material !== id
      );

      setSelectedMaterials(fieltredItems);
    } else {
      setSelectedMaterials([...selectedMaterials, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const cidade = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const materials = selectedMaterials;

    const data = new FormData();

    data.append("name", name);
    data.append("email", email);
    data.append("whatsapp", whatsapp);
    data.append("latitude", String(latitude));
    data.append("longitude", String(longitude));
    data.append("cidade", cidade);
    data.append("uf", uf);
    data.append("materials", materials.join(", "));
    if (fileUrl) data.append("image", fileUrl);

    await api.post("collection_points", data);

    navigate("/");
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft /> Voltar parar início
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do ponto de coleta</h1>

        <Dropzone onFileUploaded={setFileUrl} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              type="text"
              name="email"
              id="email"
              onChange={handleInputChange}
            />
          </div>

          <div className="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input
              type="text"
              name="whatsapp"
              id="whatsapp"
              onChange={handleInputChange}
            />
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={[51.505, -0.09]} zoom={17} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </Map>

          <div className="field">
            <label htmlFor="uf">Estado (uf)</label>
            <select
              onChange={handleSelectedUf}
              value={selectedUf}
              name="uf"
              id="uf"
            >
              <option value="0">Selecione um estado</option>
              {ufs.map(({ id, nome, sigla }) => (
                <option key={id} value={id}>{`${nome} - ${sigla}`}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="city">Cidade</label>
            <select
              onChange={handleSelectedCity}
              value={selectedCity}
              name="city"
              id="city"
            >
              <option value="0">Selecione uma cidade</option>
              {cities.map(({ id, nome }) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Materiais de coleta</h2>
            <span>Selecione um ou mais</span>
          </legend>

          <ul className="items-grid">
            {materials.map((material) => (
              <li
                className={
                  selectedMaterials.includes(material.id) ? "selected" : ""
                }
                key={material.id}
                onClick={() => handleSelectMaterial(material.id)}
              >
                <img src={material.image_url} alt={material.title} />
                <span>{material.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default CreatePoint;
