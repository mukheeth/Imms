package com.insurance.percert.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.insurance.percert.model.Order;
import com.insurance.percert.service.OrderService;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*") // CORS handled globally by CorsConfig
public class OrderController {
    @Autowired
    private OrderService orderService;

    // @Autowired
    // public OrderController(OrderService orderService) {
    // this.orderService = orderService;
    // }

    // Get all orders

    // @GetMapping("/exists")
    // public ResponseEntity<?> checkPatIdExists(@RequestParam("patId") String patId) {
    //     Order order = orderService.doesPatIdExist(patId);
    //     if (order != null) {
    //         return ResponseEntity.ok(order);
    //     } else {
    //         // Set status to 404 if the patient ID is not found
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body("PATid does not exist in the orders.");
    //     }
    // }
    @GetMapping("/exists")
    public ResponseEntity<?> checkPatIdExists(@RequestParam("patId") String patId) {
        List<Order> orders = orderService.doesPatIdExist(patId);
        if (!orders.isEmpty()) {
            return ResponseEntity.ok(orders);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("PATid does not exist in the orders.");
        }
    }

    @GetMapping("/exists/provider/{providerNpiNumber}")
    public ResponseEntity<List<Order>> getOrdersByProviderNpiNumber(@PathVariable String providerNpiNumber) {
        List<Order> orders = orderService.getOrdersByProviderNpiNumber(providerNpiNumber);
        return ResponseEntity.ok(orders);
    }


   

      @GetMapping("/exists/by-name")
    public  List<Order> getProviderByProviderName(@RequestParam String providerName) {
        System.out.println("hiiiii");
        System.out.println("Received provider name: '" + providerName + "'");
        return orderService.getOrdersByProviderName(providerName);
    }


    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    // Get a single order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    // Create a new order
    @PostMapping("/write")
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        Order createdOrder = orderService.createOrder(order);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    // Update an existing order
    @PutMapping("/{orderId}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long orderId, @RequestBody Order orderDetails) {
        Order updatedOrder = orderService.updateOrder(orderId, orderDetails);
        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }

    @PutMapping("/part/{orderId}")
    public ResponseEntity<Order> updateOrderpart(@PathVariable Long orderId, @RequestBody Order orderDetails)
            throws Exception {
        Order updatedOrder = orderService.updateOrderpartly(orderId, orderDetails);
        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }

    @PutMapping("/delete/{orderId}")
    public ResponseEntity<Order> deleteOrderpart(@PathVariable Long orderId)
            throws Exception {
        Order updatedOrder = orderService.deleteOrderpartly(orderId);
        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }

    // Delete an order
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

      @GetMapping("/by-icd-drug")
    public List<Order> findByIcdDrugName(@RequestParam("icddrugname") String icdDrugName) {
        List<Order> list = orderService.findByIcdDrugName(icdDrugName);
        if (list.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "No orders found with icddrugname '" + icdDrugName + "'."
            );
        }
        return list;
    }

    /**
     * Partial‐match search on icddrugname
     */
    @GetMapping("/search-icd-drug")
    public List<Order> searchByIcdDrugName(@RequestParam("term") String term) {
        List<Order> list = orderService.searchByIcdDrugName(term);
        if (list.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "No orders found matching icddrugname containing '" + term + "'."
            );
        }
        return list;
    }


}
