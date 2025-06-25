function generateLineItems(course) {
    return [
        {
            id: course.id,
            name: course.title,
            quantity: 1,
            price: parseInt(course.price),
            sku: `CRS-${course.id}`,
            category: "Course",
            url: `https://yourdomain.com/courses/${course.slug}`,
            image_url: course.imageUrl || null,
            type: "service"
        }
    ];
}

function buildCustomer(user) {
    return {
        id: user.id,
        name: user.fullName || user.username,
        email: user.email,
        phone: "08123456789", // statis sementara
        country: "ID"
    };
}

const STATIC_ADDRESS = {
    first_name: "Ibnu",
    last_name: "Dev",
    address: "Jl. Contoh No. 123",
    city: "Bandung",
    postal_code: "40123",
    phone: "08123456789",
    country_code: "ID"
};

module.exports = {
    generateLineItems,
    buildCustomer,
    STATIC_ADDRESS
};
