import React, { useState, useEffect } from 'react';
import { DataTable, RegisterForm, Modal, Button, Container, Flex, Card, Select, Badge } from '@miracle380301/common';
import { userApi, User, healthApi, HealthResponse } from '../services/api';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dbInfo, setDbInfo] = useState<HealthResponse | null>(null);
  const [selectedDbType, setSelectedDbType] = useState<string>('');
  const [selectedDbCategory, setSelectedDbCategory] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showDBInfoModal, setShowDBInfoModal] = useState(false);
  const [selectedDbForInfo, setSelectedDbForInfo] = useState<string>('');

  // Fetch DB info
  const fetchDbInfo = async () => {
    try {
      const info = await healthApi.check();
      setDbInfo(info);
    } catch (err) {
      console.error('Failed to fetch DB info:', err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbInfo();
    fetchUsers();
  }, []);

  // Create user
  const handleCreate = async (data: any) => {
    setCreateError(null);
    try {
      await userApi.create({
        name: data.name,
        email: data.email,
        age: data.age ? Number(data.age) : undefined,
      });
      setIsCreateModalOpen(false);
      setCreateError(null);
      fetchUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || '사용자 생성에 실패했습니다';
      setCreateError(errorMessage);
      throw err; // RegisterForm will also handle the error
    }
  };

  // Update user
  const handleUpdate = async (data: any) => {
    if (!selectedUser?.id) return;

    setUpdateError(null);
    try {
      await userApi.update(selectedUser.id, {
        name: data.name,
        email: data.email,
        age: data.age ? Number(data.age) : undefined,
      });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setUpdateError(null);
      fetchUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || '사용자 업데이트에 실패했습니다';
      setUpdateError(errorMessage);
      throw err;
    }
  };

  // Delete user
  const handleDelete = async (user: User) => {
    if (!user.id) return;

    if (window.confirm(`정말로 "${user.name}" 사용자를 삭제하시겠습니까?`)) {
      try {
        await userApi.delete(user.id);
        fetchUsers();
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  // Open edit modal
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Handle DB type selection
  const handleDbTypeChange = (value: string) => {
    setSelectedDbType(value);
  };

  // Close DB type modal
  const handleCloseDbTypeModal = () => {
    setSelectedDbType('');
  };

  // DataTable columns
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: '이름', sortable: true },
    { key: 'email', label: '이메일', sortable: true },
    { key: 'age', label: '나이', sortable: true },
    {
      key: 'createdAt',
      label: '생성일',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR'),
    },
    {
      key: 'actions',
      label: '작업',
      render: (_: any, row: User) => (
        <Flex gap="small">
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            수정
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
          >
            삭제
          </Button>
        </Flex>
      ),
    },
  ];

  // RegisterForm fields for create
  const createFields = [
    {
      name: 'name',
      label: '이름',
      type: 'text',
      placeholder: '사용자 이름',
      required: true,
    },
    {
      name: 'email',
      label: '이메일',
      type: 'email',
      placeholder: 'user@example.com',
      required: true,
    },
    {
      name: 'age',
      label: '나이',
      type: 'number',
      placeholder: '나이 (선택)',
    },
  ];

  // RegisterForm fields for edit (with default values)
  const editFields = selectedUser
    ? [
        {
          name: 'name',
          label: '이름',
          type: 'text',
          placeholder: '사용자 이름',
          required: true,
        },
        {
          name: 'email',
          label: '이메일',
          type: 'email',
          placeholder: 'user@example.com',
          required: true,
        },
        {
          name: 'age',
          label: '나이',
          type: 'number',
          placeholder: '나이 (선택)',
        },
      ]
    : [];

  return (
    <Container maxWidth="xl" padding="large">
      <Flex direction="column" gap="large">
        {/* Header */}
        <Flex justify="between" align="center">
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>사용자 관리</h1>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            사용자 추가
          </Button>
        </Flex>

        {/* Database Info Panel */}
        {dbInfo && (
          <Card
            title="데이터베이스 정보"
            variant={dbInfo.database.healthy ? 'default' : 'bordered'}
          >
            <Flex direction="column" gap="medium">
              <Flex gap="large" align="center" wrap>
                <div style={{ marginRight: '2rem' }}>
                  <strong>타입:</strong> {dbInfo.database.type.toUpperCase()}
                </div>
                <div style={{ marginRight: '2rem' }}>
                  <strong>Provider:</strong> {dbInfo.database.provider}
                </div>
                <div>
                  <strong>상태:</strong>{' '}
                  <Badge
                    variant={dbInfo.database.healthy ? 'success' : 'error'}
                  >
                    {dbInfo.database.healthy ? '✓ 정상' : '✗ 오류'}
                  </Badge>
                </div>
              </Flex>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#111827'
                }}>
                  DB Type
                </label>
                <select
                  value={selectedDbCategory}
                  onChange={(e) => setSelectedDbCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8b5cf6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">전체</option>
                  <option value="file">File-based</option>
                  <option value="nosql">NoSQL</option>
                  <option value="sql">SQL</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#111827'
                }}>
                  사용 가능한 DB
                </label>
                <select
                  value={dbInfo.database.type}
                  onChange={(e) => handleDbTypeChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8b5cf6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {selectedDbCategory === 'file' ? (
                    <option value="sqlite">SQLite</option>
                  ) : selectedDbCategory === 'nosql' ? (
                    <option value="mongodb">MongoDB</option>
                  ) : selectedDbCategory === 'sql' ? (
                    <>
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                    </>
                  ) : (
                    <>
                      <option value="sqlite">SQLite</option>
                      <option value="mongodb">MongoDB</option>
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                    </>
                  )}
                </select>
                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setSelectedDbForInfo(dbInfo?.database.type || '');
                      setShowDBInfoModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                      fontSize: '0.85rem'
                    }}
                  >
                    ℹ️ 선택한 DB 변경 방법 안내
                  </button>
                </div>
              </div>
            </Flex>
          </Card>
        )}

        {/* Error message */}
        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={users}
          searchable
          filterable
          pagination
          pageSize={10}
          loading={loading}
          title="사용자 목록"
        />

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateError(null);
          }}
          title="새 사용자 추가"
        >
          <RegisterForm
            onSubmit={handleCreate}
            fields={createFields}
            title=""
            requireTermsAcceptance={false}
            error={createError || undefined}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
            setUpdateError(null);
          }}
          title="사용자 수정"
        >
          {selectedUser && (console.log('selectedUser:', selectedUser),
            <RegisterForm
              key={selectedUser.id}
              onSubmit={handleUpdate}
              fields={editFields}
              title=""
              requireTermsAcceptance={false}
              error={updateError || undefined}
              initialValues={{
                name: selectedUser.name,
                email: selectedUser.email,
                age: selectedUser.age
              }}
            />
          )}
        </Modal>

        {/* DB Type Change Info Modal */}
        <Modal
          isOpen={!!selectedDbType && selectedDbType !== dbInfo?.database.type}
          onClose={handleCloseDbTypeModal}
          title="데이터베이스 타입 변경"
        >
          <Flex direction="column" gap="large">
            <div>
              <p style={{ marginBottom: '1rem' }}>
                <strong>{selectedDbType.toUpperCase()}</strong> 데이터베이스로 변경하려면 다음 단계를 따라주세요:
              </p>
            </div>

            <Flex direction="column" gap="medium">
              <div>
                <strong>1. backend/.env 파일을 엽니다</strong>
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  경로: packages/database/backend/.env
                </div>
              </div>

              <div>
                <strong>2. DB_TYPE 값을 변경합니다</strong>
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  DB_TYPE={selectedDbType}
                </div>
              </div>

              {selectedDbType === 'mongodb' && (
                <div>
                  <strong>3. MongoDB 연결 정보를 설정합니다</strong>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    DB_URI=mongodb://localhost:27017/mydb
                  </div>
                </div>
              )}

              {(selectedDbType === 'postgresql' || selectedDbType === 'mysql') && (
                <div>
                  <strong>3. 데이터베이스 연결 정보를 설정합니다</strong>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    DB_HOST=localhost<br />
                    DB_PORT={selectedDbType === 'postgresql' ? '5432' : '3306'}<br />
                    DB_DATABASE=mydb<br />
                    DB_USERNAME={selectedDbType === 'postgresql' ? 'postgres' : 'root'}<br />
                    DB_PASSWORD=password
                  </div>
                </div>
              )}

              <div>
                <strong>{selectedDbType === 'sqlite' ? '3' : '4'}. 백엔드 서버를 재시작합니다</strong>
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  터미널에서 Ctrl+C로 서버 중지 후 다시 시작
                </div>
              </div>
            </Flex>

            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fff3cd',
              borderRadius: '4px',
              fontSize: '0.9rem',
              border: '1px solid #ffc107'
            }}>
              ⚠️ 주의: 데이터베이스를 변경하면 기존 데이터에 접근할 수 없습니다.
            </div>

            <Flex justify="end">
              <Button variant="primary" onClick={handleCloseDbTypeModal}>
                확인
              </Button>
            </Flex>
          </Flex>
        </Modal>

        {/* DB Change Info Modal */}
        <Modal
          isOpen={showDBInfoModal}
          onClose={() => setShowDBInfoModal(false)}
          title={`${selectedDbForInfo.toUpperCase()} 데이터베이스 설정 안내`}
        >
          <Flex direction="column" gap="large">
            <div>
              <p style={{ marginBottom: '1rem' }}>
                <strong>{selectedDbForInfo.toUpperCase()}</strong> 데이터베이스 사용을 위한 설정 방법입니다:
              </p>
            </div>

            <Flex direction="column" gap="medium">
              <div>
                <strong>1. backend/.env 파일 열기</strong>
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  경로: packages/database/backend/.env
                </div>
              </div>

              <div>
                <strong>2. DB_TYPE 설정</strong>
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  DB_TYPE={selectedDbForInfo}
                </div>
              </div>

              {selectedDbForInfo === 'sqlite' && (
                <div>
                  <strong>3. SQLite 파일 경로 설정 (선택사항)</strong>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    DB_FILENAME=./database.sqlite<br />
                    DB_VERBOSE=false
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                    💡 SQLite는 추가 설정 없이 바로 사용 가능합니다.
                  </div>
                </div>
              )}

              {selectedDbForInfo === 'mongodb' && (
                <div>
                  <strong>3. MongoDB 연결 정보 설정</strong>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    DB_URI=mongodb://localhost:27017/mydb<br />
                    DB_POOL_SIZE=10
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                    💡 MongoDB 서버가 실행 중이어야 합니다.
                  </div>
                </div>
              )}

              {selectedDbForInfo === 'postgresql' && (
                <div>
                  <strong>3. PostgreSQL 연결 정보 설정</strong>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    DB_HOST=localhost<br />
                    DB_PORT=5432<br />
                    DB_DATABASE=mydb<br />
                    DB_USERNAME=postgres<br />
                    DB_PASSWORD=your_password<br />
                    DB_POOL_SIZE=10
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                    💡 PostgreSQL 서버가 실행 중이어야 하며, 데이터베이스와 사용자 계정이 생성되어 있어야 합니다.
                  </div>
                </div>
              )}

              {selectedDbForInfo === 'mysql' && (
                <div>
                  <strong>3. MySQL 연결 정보 설정</strong>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    DB_HOST=localhost<br />
                    DB_PORT=3306<br />
                    DB_DATABASE=mydb<br />
                    DB_USERNAME=root<br />
                    DB_PASSWORD=your_password<br />
                    DB_POOL_SIZE=10
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                    💡 MySQL 서버가 실행 중이어야 하며, 데이터베이스와 사용자 계정이 생성되어 있어야 합니다.
                  </div>
                </div>
              )}

              <div>
                <strong>{selectedDbForInfo === 'sqlite' ? '3' : '4'}. 백엔드 서버 재시작</strong>
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  터미널에서 Ctrl+C로 서버 중지 후<br />
                  cd packages/database/backend && npm run dev
                </div>
              </div>
            </Flex>

            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fff3cd',
              borderRadius: '4px',
              fontSize: '0.9rem',
              border: '1px solid #ffc107'
            }}>
              ⚠️ 주의: 데이터베이스를 변경하면 기존 데이터에 접근할 수 없습니다. 데이터베이스별로 데이터가 별도로 관리됩니다.
            </div>

            <Flex justify="end">
              <Button variant="primary" onClick={() => setShowDBInfoModal(false)}>
                확인
              </Button>
            </Flex>
          </Flex>
        </Modal>
      </Flex>
    </Container>
  );
};

export default UserManager;
