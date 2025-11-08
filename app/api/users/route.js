// Users API Route
export async function GET(request) {
  try {
    // TODO: Add database query logic here
    // For now, return placeholder data
    const users = [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        userType: "buyer",
        status: "active",
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        userType: "seller",
        status: "active",
        createdAt: "2024-01-20T14:15:00Z",
      },
      {
        id: 3,
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob@example.com",
        userType: "partner",
        status: "pending",
        createdAt: "2024-01-25T09:45:00Z",
      },
    ];

    return new Response(
      JSON.stringify({
        success: true,
        data: users,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, userType, status = "active" } = body;

    // TODO: Add database insertion logic here
    const newUser = {
      id: Date.now(), // Simple ID generation for demo
      firstName,
      lastName,
      email,
      userType,
      status,
      createdAt: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "User created successfully",
        data: newUser,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to create user",
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
