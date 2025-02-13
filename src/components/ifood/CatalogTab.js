import React, { useState, useEffect } from "react";
import {
  Button,
  Spinner,
  Table,
  Form,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../services/api";

function CatalogTab() {
  const [loading, setLoading] = useState(false);

  // Catálogos
  const [catalogList, setCatalogList] = useState([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Categorias
  const [categoryList, setCategoryList] = useState([]);

  // Itens
  const [sellableItems, setSellableItems] = useState([]);
  const [unsellableItems, setUnsellableItems] = useState([]);

  // -------------------
  // Modal Edição
  // -------------------
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItemId, setEditItemId] = useState("");
  const [editProductId, setEditProductId] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editExternalCode, setEditExternalCode] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState(0);

  const [editShifts, setEditShifts] = useState({
    startTime: "00:00",
    endTime: "23:59",
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  const [editIsPizza, setEditIsPizza] = useState(false);
  const [pizzaSizes, setPizzaSizes] = useState([]);
  const [pizzaCrusts, setPizzaCrusts] = useState([]);
  const [pizzaEdges, setPizzaEdges] = useState([]);
  const [pizzaToppings, setPizzaToppings] = useState([]);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [selectedCrustId, setSelectedCrustId] = useState("");
  const [selectedEdgeId, setSelectedEdgeId] = useState("");
  const [selectedToppings, setSelectedToppings] = useState([]);

  // -------------------
  // Modal Criação Produto
  // -------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductExternalCode, setNewProductExternalCode] = useState("");
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductOriginalPrice, setNewProductOriginalPrice] = useState(0);
  const [newProductCategoryId, setNewProductCategoryId] = useState("");
  const [newProductIsPizza, setNewProductIsPizza] = useState(false);

  // -- Campos extras:
  const [newProductServing, setNewProductServing] = useState("SERVES_1");
  const [newProductQuantity, setNewProductQuantity] = useState(0);
  const [newProductWeightUnit, setNewProductWeightUnit] = useState("kg");
  const [newProductImagePath, setNewProductImagePath] = useState("");
  const [newProductTags, setNewProductTags] = useState([]);
  const [newProductDietary, setNewProductDietary] = useState([]); // array de strings

  // Carregar catálogos no mount
  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    setLoading(true);
    try {
      const resp = await api.get("/ifood/catalogs");
      const data = resp.data || [];
      setCatalogList(data);
      if (data.length > 0) {
        setSelectedCatalogId(data[0].catalogId);
        setSelectedGroupId(data[0].groupId);
      }
    } catch (err) {
      console.error("[loadCatalogs] Erro:", err);
      toast.error("Não foi possível carregar catálogos.");
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesForCatalog = async (catalogId) => {
    if (!catalogId) return;
    setLoading(true);
    try {
      const resp = await api.get(`/ifood/catalogs/${catalogId}/categories`, {
        params: { includeItems: false },
      });
      const data = resp.data;
      let catArray = [];
      if (Array.isArray(data)) catArray = data;
      else if (data?.categories) catArray = data.categories;
      else if (data?.id) catArray = [data];

      setCategoryList(catArray);
    } catch (error) {
      console.error("[loadCategoriesForCatalog] Erro:", error);
      toast.error("Não foi possível carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  const loadItemsForCatalog = async () => {
    if (!selectedCatalogId || !selectedGroupId) {
      toast.warning("Selecione um catálogo.");
      return;
    }
    setLoading(true);
    try {
      const sellResp = await api.get(
        `/ifood/catalogs/${selectedGroupId}/sellableItems`
      );
      setSellableItems(sellResp.data || []);

      const unResp = await api.get(
        `/ifood/catalogs/${selectedCatalogId}/unsellableItems`
      );
      setUnsellableItems(unResp.data || []);

      await loadCategoriesForCatalog(selectedCatalogId);
    } catch (error) {
      console.error("[loadItemsForCatalog] Erro:", error);
      toast.error("Não foi possível carregar itens.");
    } finally {
      setLoading(false);
    }
  };

  // ===================
  // Modal Edição
  // ===================
  const handleOpenEditModal = (item) => {
    setEditItemId(item.itemId || "");
    setEditProductId(item.productId || "");
    setEditCategoryId(item.categoryId || "");
    setEditName(item.itemName || "");
    setEditDescription(item.itemDescription || "");
    setEditExternalCode(item.itemExternalCode || "");
    setEditPrice(item.itemPrice?.value || 0);
    setEditOriginalPrice(item.itemPrice?.originalValue || 0);

    if (Array.isArray(item.itemSchedules) && item.itemSchedules.length > 0) {
      const s = item.itemSchedules[0];
      setEditShifts({
        startTime: s.startTime || "00:00",
        endTime: s.endTime || "23:59",
        monday: !!s.monday,
        tuesday: !!s.tuesday,
        wednesday: !!s.wednesday,
        thursday: !!s.thursday,
        friday: !!s.friday,
        saturday: !!s.saturday,
        sunday: !!s.sunday,
      });
    } else {
      setEditShifts({
        startTime: "00:00",
        endTime: "23:59",
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      });
    }

    const cat = categoryList.find((c) => c.id === item.categoryId);
    if (cat?.template === "PIZZA") {
      setEditIsPizza(true);
      const pz = cat.pizza || {};
      setPizzaSizes(pz.sizes || []);
      setPizzaCrusts(pz.crusts || []);
      setPizzaEdges(pz.edges || []);
      setPizzaToppings(pz.toppings || []);
      setSelectedSizeId("");
      setSelectedCrustId("");
      setSelectedEdgeId("");
      setSelectedToppings([]);
    } else {
      setEditIsPizza(false);
      setPizzaSizes([]);
      setPizzaCrusts([]);
      setPizzaEdges([]);
      setPizzaToppings([]);
      setSelectedSizeId("");
      setSelectedCrustId("");
      setSelectedEdgeId("");
      setSelectedToppings([]);
    }

    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveEdit = async () => {
    if (!editItemId || !editProductId) {
      toast.warning("Faltam IDs.");
      return;
    }
    setLoading(true);
    try {
      // 1) Editar Produto
      await api.put(`/ifood/products/${editProductId}`, {
        name: editName,
        description: editDescription,
        externalCode: editExternalCode,
        serving: "SERVES_1", 
        weight: { quantity: 0, unit: "kg" },
        dietaryRestrictions: [],
        imagePath: "", // se quiser
      });

      // 2) Atualizar Preço
      await api.patch("/ifood/items/price", {
        itemId: editItemId,
        price: {
          value: Number(editPrice),
          originalValue: Number(editOriginalPrice),
        },
      });

      // 3) Atualizar Item
      const itemBody = {
        item: {
          id: editItemId,
          type: editIsPizza ? "PIZZA" : "NORMAL",
          categoryId: editCategoryId,
          status: "AVAILABLE",
          price: {
            value: Number(editPrice),
            originalValue: Number(editOriginalPrice),
          },
          externalCode: editExternalCode,
          index: 0,
          productId: editProductId,
          shifts: [
            {
              startTime: editShifts.startTime,
              endTime: editShifts.endTime,
              monday: editShifts.monday,
              tuesday: editShifts.tuesday,
              wednesday: editShifts.wednesday,
              thursday: editShifts.thursday,
              friday: editShifts.friday,
              saturday: editShifts.saturday,
              sunday: editShifts.sunday,
            },
          ],
          tags: [],
          contextModifiers: [],
        },
        products: [],
        optionGroups: [],
        options: [],
      };

      await api.put("/ifood/items", itemBody);

      toast.success("Item atualizado com sucesso!");
      setShowEditModal(false);
      loadItemsForCatalog();
    } catch (error) {
      console.error("[handleSaveEdit] Erro:", error);
      toast.error("Não foi possível atualizar o item.");
    } finally {
      setLoading(false);
    }
  };

  // Excluir Produto
  const handleDeleteProduct = async (productId) => {
    if (!productId) return;
    if (!window.confirm("Deseja excluir este produto?")) return;
    setLoading(true);
    try {
      await api.delete(`/ifood/products/${productId}`);
      toast.success("Produto excluído.");
      loadItemsForCatalog();
    } catch (error) {
      console.error("[handleDeleteProduct] Erro:", error);
      toast.error("Não foi possível excluir.");
    } finally {
      setLoading(false);
    }
  };

  // Togglar Topping
  const handleToggleTopping = (tId) => {
    if (!tId) return;
    const exists = selectedToppings.includes(tId);
    if (exists) {
      setSelectedToppings((prev) => prev.filter((x) => x !== tId));
    } else {
      setSelectedToppings((prev) => [...prev, tId]);
    }
  };

  // ===================
  // CRIAR PRODUTO
  // ===================
  const handleOpenCreateModal = () => {
    setNewProductName("");
    setNewProductDescription("");
    setNewProductExternalCode("");
    setNewProductPrice(0);
    setNewProductOriginalPrice(0);
    setNewProductCategoryId("");
    setNewProductIsPizza(false);

    // novos campos
    setNewProductServing("SERVES_1");
    setNewProductQuantity(0);
    setNewProductWeightUnit("kg");
    setNewProductImagePath("");
    setNewProductTags([]);
    setNewProductDietary([]); 

    setShowCreateModal(true);
  };
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  // Toggle dietaryRestrictions no array
  const handleDietaryToggle = (val) => {
    if (!val) return;
    if (newProductDietary.includes(val)) {
      setNewProductDietary(newProductDietary.filter((d) => d !== val));
    } else {
      setNewProductDietary([...newProductDietary, val]);
    }
  };

  // Toggle tags no array
  const handleTagToggle = (val) => {
    if (!val) return;
    if (newProductTags.includes(val)) {
      setNewProductTags(newProductTags.filter((t) => t !== val));
    } else {
      setNewProductTags([...newProductTags, val]);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProductName) {
      toast.warning("Informe o nome do produto.");
      return;
    }
    if (!newProductCategoryId) {
      toast.warning("Selecione uma categoria.");
      return;
    }
    setLoading(true);
    try {
      // 1) Criar Produto
      const createResp = await api.post("/ifood/products", {
        name: newProductName,
        description: newProductDescription,
        externalCode: newProductExternalCode,
        serving: newProductServing, 
        weight: {
          quantity: Number(newProductQuantity),
          unit: newProductWeightUnit,
        },
        dietaryRestrictions: newProductDietary, 
        imagePath: newProductImagePath,
        // tags de produto, se o iFood aceitar no create. 
        // (Na doc de v2, as "tags" normalmente ficam no item, mas se seu merchant permitir, pode mandar aqui)
      });
      const createdProduct = createResp.data;

      // 2) Criar Item
      const itemBody = {
        item: {
          id: "",
          type: newProductIsPizza ? "PIZZA" : "NORMAL",
          categoryId: newProductCategoryId,
          status: "AVAILABLE",
          price: {
            value: Number(newProductPrice),
            originalValue: Number(newProductOriginalPrice),
          },
          externalCode: newProductExternalCode || "no-code",
          index: 0,
          productId: createdProduct.id,
          shifts: [
            {
              startTime: "00:00",
              endTime: "23:59",
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: true,
            },
          ],
          // tags e contextModifiers no item
          tags: newProductTags, 
          contextModifiers: [],
        },
        products: [],
        optionGroups: [],
        options: [],
      };

      await api.put("/ifood/items", itemBody);

      toast.success("Produto criado com sucesso!");
      setShowCreateModal(false);
      loadItemsForCatalog();
    } catch (error) {
      console.error("[handleCreateProduct] Erro:", error);
      toast.error("Não foi possível criar o produto.");
    } finally {
      setLoading(false);
    }
  };

  // ===================
  // RENDER
  // ===================
  return (
    <div>
      <h4>Catálogo iFood</h4>

      <Form.Group className="mb-3">
        <Form.Label>Selecione um Catálogo:</Form.Label>
        <Form.Select
          value={selectedCatalogId}
          onChange={(e) => {
            const catId = e.target.value;
            setSelectedCatalogId(catId);
            const found = catalogList.find((c) => c.catalogId === catId);
            if (found) {
              setSelectedGroupId(found.groupId);
            }
          }}
        >
          <option value="">Selecione...</option>
          {catalogList.map((cat) => (
            <option key={cat.catalogId} value={cat.catalogId}>
              {cat.catalogId} (groupId: {cat.groupId})
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <div className="mb-3">
        <Button variant="primary" onClick={loadItemsForCatalog} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Carregar Itens"}
        </Button>{" "}
        <Button variant="success" onClick={handleOpenCreateModal}>
          Criar Produto
        </Button>
      </div>

      {/* SELLABLE ITEMS */}
      <h5 className="mt-4">Itens Vendáveis</h5>
      {sellableItems.length === 0 && !loading && <p>Nenhum item vendável.</p>}
      {sellableItems.length > 0 && (
        <Table bordered hover size="sm" className="mt-2">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Nome</th>
              <th>Preço</th>
              <th style={{ width: "180px" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sellableItems.map((item, idx) => (
              <tr key={idx}>
                <td>
                  {item.categoryName}
                  <br />
                  <small>({item.categoryId})</small>
                </td>
                <td>
                  {item.itemName}
                  <br />
                  <small className="text-muted">{item.itemDescription}</small>
                </td>
                <td>
                  R$ {item.itemPrice?.value}
                  {item.itemPrice?.originalValue
                    ? ` / R$ ${item.itemPrice.originalValue}`
                    : ""}
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleOpenEditModal(item)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteProduct(item.productId)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* UNSellable */}
      <h5 className="mt-4">Itens Indisponíveis (Unsellable)</h5>
      {Array.isArray(unsellableItems.categories) &&
      unsellableItems.categories.length > 0 ? (
        unsellableItems.categories.map((cat, idx) => (
          <Table bordered hover size="sm" className="mt-2" key={idx}>
            <thead>
              <tr>
                <th>Categoria ID</th>
                <th>Item ID</th>
                <th>Produto ID</th>
                <th>Restrições</th>
              </tr>
            </thead>
            <tbody>
              {cat.unsellableItems?.map((ui, i2) => (
                <tr key={i2}>
                  <td>{cat.id}</td>
                  <td>{ui.id}</td>
                  <td>{ui.productId}</td>
                  <td>{(ui.restrictions || []).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ))
      ) : (
        !loading && <p>Nenhum item indisponível.</p>
      )}

      {/* MODAL EDITAR ITEM */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Item / Produto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Categoria</Form.Label>
            <Form.Select
              value={editCategoryId}
              onChange={(e) => {
                const newCatId = e.target.value;
                setEditCategoryId(newCatId);
                const cObj = categoryList.find((x) => x.id === newCatId);
                if (cObj?.template === "PIZZA") {
                  setEditIsPizza(true);
                  const pz = cObj.pizza || {};
                  setPizzaSizes(pz.sizes || []);
                  setPizzaCrusts(pz.crusts || []);
                  setPizzaEdges(pz.edges || []);
                  setPizzaToppings(pz.toppings || []);
                } else {
                  setEditIsPizza(false);
                  setPizzaSizes([]);
                  setPizzaCrusts([]);
                  setPizzaEdges([]);
                  setPizzaToppings([]);
                }
              }}
            >
              <option value="">Selecione...</option>
              {categoryList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.template})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Nome (item)</Form.Label>
                <Form.Control
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Código Externo</Form.Label>
                <Form.Control
                  type="text"
                  value={editExternalCode}
                  onChange={(e) => setEditExternalCode(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-2">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </Form.Group>

          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Preço</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Preço Original</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={editOriginalPrice}
                  onChange={(e) => setEditOriginalPrice(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Início</Form.Label>
                <Form.Control
                  type="time"
                  value={editShifts.startTime}
                  onChange={(e) =>
                    setEditShifts({ ...editShifts, startTime: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Fim</Form.Label>
                <Form.Control
                  type="time"
                  value={editShifts.endTime}
                  onChange={(e) =>
                    setEditShifts({ ...editShifts, endTime: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex flex-wrap mt-2">
            {[
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ].map((day) => (
              <Form.Check
                key={day}
                type="checkbox"
                label={day}
                checked={editShifts[day]}
                onChange={(e) =>
                  setEditShifts({ ...editShifts, [day]: e.target.checked })
                }
                className="me-3"
              />
            ))}
          </div>

          {editIsPizza && (
            <>
              <hr />
              <h6>Configurações de Pizza</h6>
              {/* Tamanhos */}
              {pizzaSizes.length > 0 && (
                <Form.Group className="mb-2">
                  <Form.Label>Tamanho</Form.Label>
                  <Form.Select
                    value={selectedSizeId}
                    onChange={(e) => setSelectedSizeId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {pizzaSizes.map((sz) => (
                      <option key={sz.id} value={sz.id}>
                        {sz.name} ({sz.slices} pedaços)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              {/* Massas */}
              {pizzaCrusts.length > 0 && (
                <Form.Group className="mb-2">
                  <Form.Label>Massa</Form.Label>
                  <Form.Select
                    value={selectedCrustId}
                    onChange={(e) => setSelectedCrustId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {pizzaCrusts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              {/* Bordas */}
              {pizzaEdges.length > 0 && (
                <Form.Group className="mb-2">
                  <Form.Label>Borda</Form.Label>
                  <Form.Select
                    value={selectedEdgeId}
                    onChange={(e) => setSelectedEdgeId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {pizzaEdges.map((ed) => (
                      <option key={ed.id} value={ed.id}>
                        {ed.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              {/* Toppings */}
              {pizzaToppings.length > 0 && (
                <div className="mb-2">
                  <Form.Label>Sabores (Toppings)</Form.Label>
                  {pizzaToppings.map((top) => (
                    <Form.Check
                      key={top.id}
                      type="checkbox"
                      label={top.name}
                      checked={selectedToppings.includes(top.id)}
                      onChange={() => handleToggleTopping(top.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveEdit} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Salvar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL CRIAR PRODUTO */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Criar Novo Produto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Nome, desc, external code */}
          <Form.Group className="mb-2">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              type="text"
              value={newProductDescription}
              onChange={(e) => setNewProductDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Código Externo</Form.Label>
            <Form.Control
              type="text"
              value={newProductExternalCode}
              onChange={(e) => setNewProductExternalCode(e.target.value)}
            />
          </Form.Group>

          {/* Price e Original Price */}
          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Preço</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Preço Original</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={newProductOriginalPrice}
                  onChange={(e) => setNewProductOriginalPrice(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Categoria */}
          <Form.Group className="mb-2">
            <Form.Label>Categoria</Form.Label>
            <Form.Select
              value={newProductCategoryId}
              onChange={(e) => {
                const cId = e.target.value;
                setNewProductCategoryId(cId);
                const cObj = categoryList.find((x) => x.id === cId);
                setNewProductIsPizza(cObj?.template === "PIZZA");
              }}
            >
              <option value="">Selecione...</option>
              {categoryList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.template || "DEFAULT"})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {newProductIsPizza && (
            <p className="text-info">
              <small>Este produto será criado como Pizza.</small>
            </p>
          )}

          {/* Serving */}
          <Form.Group className="mb-2">
            <Form.Label>Serving (Quantas pessoas?)</Form.Label>
            <Form.Select
              value={newProductServing}
              onChange={(e) => setNewProductServing(e.target.value)}
            >
              <option value="SERVES_1">SERVES_1</option>
              <option value="SERVES_2">SERVES_2</option>
              <option value="SERVES_3">SERVES_3</option>
              <option value="SERVES_4">SERVES_4</option>
              {/* etc., dependendo do que o iFood aceita */}
            </Form.Select>
          </Form.Group>

          {/* Weight */}
          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Peso (quantity)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={newProductQuantity}
                  onChange={(e) => setNewProductQuantity(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Unidade</Form.Label>
                <Form.Control
                  type="text"
                  value={newProductWeightUnit}
                  onChange={(e) => setNewProductWeightUnit(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* ImagePath */}
          <Form.Group className="mb-2">
            <Form.Label>Imagem (imagePath)</Form.Label>
            <Form.Control
              type="text"
              placeholder="ex: pasta/imagem.png"
              value={newProductImagePath}
              onChange={(e) => setNewProductImagePath(e.target.value)}
            />
          </Form.Group>

          {/* Dietary Restrictions */}
          <Form.Group className="mb-2">
            <Form.Label>Restrições Alimentares</Form.Label>
            <div>
              {["VEGAN", "VEGETARIAN", "ORGANIC"].map((val) => (
                <Form.Check
                  key={val}
                  type="checkbox"
                  label={val}
                  checked={newProductDietary.includes(val)}
                  onChange={() => handleDietaryToggle(val)}
                />
              ))}
            </div>
          </Form.Group>

          {/* Tags */}
          <Form.Group className="mb-2">
            <Form.Label>Tags</Form.Label>
            <div>
              {["PROMO", "GLUTEN_FREE", "HOT"].map((tg) => (
                <Form.Check
                  key={tg}
                  type="checkbox"
                  label={tg}
                  checked={newProductTags.includes(tg)}
                  onChange={() => handleTagToggle(tg)}
                />
              ))}
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleCreateProduct} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Criar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CatalogTab;
