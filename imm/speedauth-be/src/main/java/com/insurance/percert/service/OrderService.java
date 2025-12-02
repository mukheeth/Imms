package com.insurance.percert.service;

import java.util.List;

import com.insurance.percert.model.Order;

public interface OrderService {
    List<Order> getAllOrders();

    Order getOrderById(Long orderId);

    Order createOrder(Order order);

    Order updateOrder(Long orderId, Order order);

    void deleteOrder(Long orderId);

    // List<Order> getOrdersByPatientUniqueId(String uniquePatientNumber);
    List<Order> doesPatIdExist(String patId);
    List<Order> getOrdersByProviderNpiNumber(String providerNpiNumber);
    List<Order> getOrdersByProviderName(String providerName);


    Order updateOrderpartly(Long orderId, Order orderDetails) throws Exception;
    Order deleteOrderpartly(Long orderId) throws Exception;

    List<Order> findByIcdDrugName(String icdDrugName);
    List<Order> searchByIcdDrugName(String term);

}
