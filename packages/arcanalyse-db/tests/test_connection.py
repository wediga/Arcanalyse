def test_connection(db_connection):
    result = db_connection.execute("SELECT 1").fetchone()
    assert result == (1,)


def test_database_name(db_connection):
    result = db_connection.execute("SELECT current_database()").fetchone()
    assert result == ("arcanalyse_test",)
